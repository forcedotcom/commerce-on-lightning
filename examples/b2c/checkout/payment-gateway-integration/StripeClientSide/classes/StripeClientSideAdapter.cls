global with sharing class StripeClientSideAdapter implements commercepayments.PaymentGatewayAdapter, commercepayments.ClientSidePaymentAdapter {

    private static final commercepayments.SalesforceResultCodeInfo RC_SUCCESS = toCodeInfo(commercepayments.SalesforceResultCode.Success);
    private static final commercepayments.SalesforceResultCodeInfo RC_DECLINE = toCodeInfo(commercepayments.SalesforceResultCode.Decline);
    private static final commercepayments.SalesforceResultCodeInfo RC_REQUIRES_REVIEW = toCodeInfo(commercepayments.SalesforceResultCode.RequiresReview);
    private static final commercepayments.SalesforceResultCodeInfo RC_VALIDATION_ERROR = toCodeInfo(commercepayments.SalesforceResultCode.ValidationError);
    private static final List<String> DECLINE_CODES = new List<String>{'card_declined', 'incorrect_cvc', 'expired_card',
     'authentication_required', 'card_not_supported', 'currency_not_supported', 'incorrect_number', 'incorrect_zip'};
    // see https://stripe.com/docs/currencies#zero-decimal
    private static final List<String> ZERO_DECIMAL_CURRENCY = new List<String>{
        'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga',
        'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'};
    private static final List<String> AUTHORIZED_INTENT_STATUS = new List<String>{'succeeded', 'requires_capture'};

    global StripeClientSideAdapter() {
    }

    global commercepayments.GatewayResponse processRequest(commercepayments.paymentGatewayContext gatewayContext) {
        commercepayments.RequestType requestType = gatewayContext.getPaymentRequestType();
        commercepayments.PaymentGatewayRequest paymentRequest = gatewayContext.getPaymentRequest();
        commercepayments.GatewayResponse response;

        try {
        if (requestType == commercepayments.RequestType.Authorize) {
                response = createAuthResponse((commercepayments.AuthorizationRequest) paymentRequest);
            } else if (requestType == commercepayments.RequestType.Capture) {
                response =  createCaptureResponse((commercepayments.CaptureRequest) paymentRequest);
            } else if (requestType == commercepayments.RequestType.Sale) {
                response =  createSaleResponse((commercepayments.SaleRequest) paymentRequest);
            } else if (requestType == commercepayments.RequestType.ReferencedRefund) {
                response = createRefundResponse((commercepayments.ReferencedRefundRequest) paymentRequest);
            } else if (requestType == commercepayments.RequestType.AuthorizationReversal) {
                response = createAuthReversalResponse((commercepayments.AuthorizationReversalRequest) paymentRequest);
            } else if (requestType == commercepayments.RequestType.PostAuth) {
                response = createPostAuthResponse((commercepayments.PostAuthorizationRequest)paymentRequest);
            } else if (requestType == commercepayments.RequestType.Tokenize) {
                response = createTokenizeResponse((commercepayments.PaymentMethodTokenizationRequest) paymentRequest);
            }
            return response;
        } catch (StripeValidationException e) {
             return new commercepayments.GatewayErrorResponse('400', e.getMessage());
        }
    }

    public commercepayments.GatewayResponse createPostAuthResponse(commercepayments.PostAuthorizationRequest postAuthRequest) {
        // API: https://stripe.com/docs/api/payment_intents/retrieve
        commercepayments.PostAuthApiPaymentMethodRequest apiPaymentMethod =(commercepayments.PostAuthApiPaymentMethodRequest) postAuthRequest.paymentMethod;
        commercepayments.AlternativePaymentMethodRequest altPaymentMethod= (commercepayments.AlternativePaymentMethodRequest) apiPaymentMethod.alternativePaymentMethod;
        String gatewayToken = (String)altPaymentMethod.gatewayToken;
        String currencyIsoCode = postAuthRequest.currencyIsoCode;
        String amount = toStripeCurrencyUnits(currencyIsoCode, postAuthRequest.amount);
        commercepayments.PostAuthorizationResponse postAuthResponse = new commercepayments.PostAuthorizationResponse();
        try{
            HttpResponse response = doGet('payment_intents/'+gatewayToken);

            String body = response.getBody();
            String errorType;
            String errorCode;
            String errorMessage;
            Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(body);
            String intentStatus = (String)results.get('status');
            Integer sc = response.getStatusCode();

            postAuthResponse.setGatewayDate(system.now());

            if (sc >= 200 && sc < 300
                    && results.get('id') != null && gatewayToken.equals((String) results.get('id'))
                    && results.get('currency') != null && currencyIsoCode.equalsIgnoreCase((String) results.get('currency'))
                    && results.get('amount') != null
                    && String.valueOf(results.get('amount')).equals(amount)
                    && AUTHORIZED_INTENT_STATUS.contains(intentStatus)
                    ) {
                postAuthResponse.setGatewayAuthCode((String) results.get('id'));
                postAuthResponse.setGatewayResultCode('success');
                postAuthResponse.setSalesforceResultCodeInfo(RC_SUCCESS);
                postAuthResponse.setAmount(postAuthRequest.amount);
            }else if(results.get('error') !=null){
                Map<String, Object> error = (Map<String, Object>) results.get('error');
                errorType = (String) error.get('type');
                errorCode = (String) error.get('code');
                postAuthResponse.setGatewayResultCode(errorCode);
                postAuthResponse.setGatewayMessage((String) error.get('message'));
                postAuthResponse.setSalesforceResultCodeInfo(RC_DECLINE);
            }
            else {
                if(results.get('currency') != null && !currencyIsoCode.equalsIgnoreCase((String)results.get('currency'))){
                    errorCode = 'currency_mismatch';
                    errorMessage = 'Invalid Currency: ' + results.get('currency') + '!=' + currencyIsoCode;
                }else if(results.get('amount') != null && amount != String.valueOf(results.get('amount'))){
                    errorCode = 'amount_mismatch';
                    errorMessage = 'Invalid Amount: ' + results.get('amount') + '!=' + amount;
                }else if(!AUTHORIZED_INTENT_STATUS.contains(intentStatus)){
                    errorCode = intentStatus;
                    errorMessage = 'Intent Not Authorized: ' + intentStatus;
                }else {
                    return new commercepayments.GatewayErrorResponse(String.valueOf(sc), 'ERROR: ' + body);
                }
                postAuthResponse.setGatewayResultCode(errorCode);
                postAuthResponse.setGatewayMessage(errorMessage);
                postAuthResponse.setSalesforceResultCodeInfo(RC_DECLINE);
            }
        }catch(Exception e){
            return new commercepayments.GatewayErrorResponse('Exception: ', e.getMessage());
        }
        // TODO: more failure cases?
        return postAuthResponse;
    }

    public commercepayments.GatewayResponse createTokenizeResponse(commercepayments.PaymentMethodTokenizationRequest tokenizeRequest) {
        // API: https://stripe.com/docs/api/payment_methods

        commercepayments.CardPaymentMethodRequest cardPaymentMethod = tokenizeRequest.cardPaymentMethod;

        Map<String, String> params = new Map<String, String>();
        params.put('type', 'card');
        params.put('card[number]', cardPaymentMethod.cardNumber);
        params.put('card[exp_month]', String.valueOf(cardPaymentMethod.expiryMonth));
        params.put('card[exp_year]', String.valueOf(cardPaymentMethod.expiryYear));
        params.put('card[cvc]', cardPaymentMethod.cvv);

        // add fraud data
        if (tokenizeRequest.ipAddress != null) {
            params.put('ip', tokenizeRequest.ipAddress);
        }
        Map<String, String> additionalData = tokenizeRequest.additionalData;
        if (additionalData != null) {
            params.put('referrer', urlEncode(additionalData.get('referrer')));
            params.put('user_agent', urlEncode(additionalData.get('user_agent')));
            params.put('payment_user_agent', urlEncode(additionalData.get('payment_user_agent')));
        }

        commercepayments.AddressRequest billingAddress = tokenizeRequest.address;

        if (billingAddress != null) {
            params.put('billing_details[name]', urlEncode(cardPaymentMethod.cardHolderName));
            params.put('billing_details[address[line1]]', billingAddress.street);
            params.put('billing_details[address[city]]', billingAddress.city);
            params.put('billing_details[address[state]]', billingAddress.state);
            params.put('billing_details[address[postal_code]]', billingAddress.postalCode);
            // Stripe expects an ISO 3166-1 alpha-2 two-letter country code.
            params.put('billing_details[address[country]]', billingAddress.country);
        }

        HttpResponse response = doPost('payment_methods', params);
        String body = response.getBody();
        Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(body);
        Integer sc = response.getStatusCode();
        commercepayments.PaymentMethodTokenizationResponse tokenizeResponse = new commercepayments.PaymentMethodTokenizationResponse();

        tokenizeResponse.setGatewayDate(system.now());

        if (sc >= 200 && sc < 300) {
            tokenizeResponse.setGatewayTokenEncrypted((String) results.get('id'));
            tokenizeResponse.setGatewayResultCode('success');
            tokenizeResponse.setSalesforceResultCodeInfo(RC_SUCCESS);
        }
        else {
            // TODO: lots of error mapping/handling
            Map<String, Object> error = (Map<String, Object>) results.get('error');
            String errorType = (String) error.get('type');
            String errorCode = (String) error.get('code');

            if (errorType.equals('card_error') && DECLINE_CODES.contains(errorCode) ) {
                tokenizeResponse.setGatewayResultCode(errorCode);
                tokenizeResponse.setGatewayResultCodeDescription((String) error.get('decline_code'));
                tokenizeResponse.setGatewayMessage((String) error.get('message'));
                tokenizeResponse.setSalesforceResultCodeInfo(RC_DECLINE);
            } else {
                return new commercepayments.GatewayErrorResponse(String.valueOf(sc), 'ERROR: ' + body);
            }
        }

        // TODO: more failure cases?

        return tokenizeResponse;
    }

    public commercepayments.GatewayResponse createAuthResponse(commercepayments.AuthorizationRequest authRequest) {
        // API: https://stripe.com/docs/api/payment_intents
        //      https://stripe.com/docs/api/charges/create
        commercepayments.AuthApiPaymentMethodRequest paymentMethod = authRequest.paymentMethod;

        // get the cardPaymentMethod object with the token
        QueryUtils q = new QueryUtils(CardPaymentMethod.SObjectType);
        q.getSelectClause().addField('GatewayToken', false);
        q.getSelectClause().addField('GatewayTokenEncrypted', false);
        q.setWhereClause(' WHERE Id =' + '\'' + paymentMethod.id + '\'');
        CardPaymentMethod cardPaymentMethod = (CardPaymentMethod)Database.query(q.buildSOQL())[0];

        String token = cardPaymentMethod.GatewayTokenEncrypted;
        if (token == null) {
            token = cardPaymentMethod.GatewayToken;
        }
        String currencyIsoCode = authRequest.currencyIsoCode;
        String amount = toStripeCurrencyUnits(currencyIsoCode, authRequest.amount);

        Map<String, String> params = new Map<String, String>();
        params.put('amount', amount);
        params.put('currency', currencyIsoCode);

        commercepayments.AuthorizationResponse authResponse = new commercepayments.AuthorizationResponse();
        authResponse.setGatewayDate(system.now());

        HttpResponse response;
        String body;
        Map<String, Object> intent;
        Map<String, Object> charge;
        String gatewayAuthCode;

        if (token.startsWith('pm_')) {
            // API: https://stripe.com/docs/api/payment_intents
            Map<String, String> additionalData = authRequest.additionalData;
            String paymentIntentId = (additionalData != null) ? additionalData.get('paymentIntentId') : null;

            if (paymentIntentId == null) {
                //  First auth call
                //  API: https://stripe.com/docs/api/payment_intents/create
                params.put('amount', String.valueOf(amount));
                params.put('currency', currencyIsoCode);
                params.put('payment_method', urlEncode(token));
                params.put('confirm', 'true'); //  create & authorize
                params.put('confirmation_method', 'manual'); // e.g. 3DS
                params.put('capture_method', 'manual');

                response = doPost('payment_intents', params);
            } else {
                //  Second auth call (for 3DS)
                //  API: https://stripe.com/docs/api/payment_intents/confirm
                response = doPost('payment_intents/' + paymentIntentId + '/confirm', params);
            }

            body = response.getBody();
            intent = (Map<String, Object>) JSON.deserializeUntyped(body);

            if ('requires_action'.equals(intent.get('status'))) {
                //  3DS case
                //  This is for illustration only.  3DS is not supported server-side.
                authResponse.setGatewayResultCode((String) intent.get('status'));
                //  authResponse.setGatewayReferenceDetails((String) intent.get('client_secret'));
                authResponse.setGatewayResultCodeDescription((String) intent.get('client_secret'));
                authResponse.setSalesforceResultCodeInfo(RC_REQUIRES_REVIEW);
                return authResponse;
            }

            Map<String, Object> charges = (Map<String, Object>) intent.get('charges');

            if (charges != null) {
                Object[] data = (Object[]) charges.get('data');
                if (data != null) {
                    charge = (Map<String, Object>) data[0];
                }
            }

            gatewayAuthCode = (String) intent.get('id');
        } else {
            // API: https://stripe.com/docs/api/charges/create
            params.put('amount', String.valueOf(amount));
            params.put('currency', currencyIsoCode);
            params.put('source', urlEncode(token));
            params.put('capture', 'false');

            response = doPost('charges', params);

            body = response.getBody();
            charge = (Map<String, Object>) JSON.deserializeUntyped(body);
            gatewayAuthCode = (String) charge.get('id');
        }

        Integer sc = response.getStatusCode();
        // map: https://stripe.com/docs/api/errors
        // to: https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_enum_commercepayments_SalesforceResultCode.htm

        if (sc >= 200 && sc < 300) {
            authResponse.setGatewayResultCode((String) charge.get('status'));
            authResponse.setGatewayResultCodeDescription((String) charge.get('status'));
            authResponse.setGatewayAuthCode(gatewayAuthCode);
            authResponse.setSalesforceResultCodeInfo(RC_SUCCESS);
            authResponse.setAmount(fromStripeCurrencyUnits(currencyIsoCode, (Long)charge.get('amount')));
        } else {
            // TODO: lots of error mapping/handling
            Map<String, Object> error = (Map<String, Object>) intent.get('error');
            Map<String, Object> paymentIntent = (Map<String, Object>) error.get('payment_intent');
            String errorCode = (String) error.get('code');
            String errorType;

            if (paymentIntent != null) {
                Map<String, Object> lastPaymentError = (Map<String, Object>) paymentIntent.get('last_payment_error');
                errorType = (String) lastPaymentError.get('type');
            } else {
                errorType = (String) error.get('type');
            }

            if (errorType.equals('card_error') && DECLINE_CODES.contains(errorCode) ) {
                authResponse.setGatewayResultCode(errorCode);
                authResponse.setGatewayResultCodeDescription((String) error.get('decline_code'));
                authResponse.setGatewayMessage((String) error.get('message'));
                authResponse.setSalesforceResultCodeInfo(RC_DECLINE);
            } else {
                return new commercepayments.GatewayErrorResponse(String.valueOf(sc), 'ERROR: ' + body);
            }
        }

        //  Make sure the token from the response gets encrypted in the payment gateway log.
        commercepayments.PaymentMethodTokenizationResponse paymentMethodTokenizationResponse = new commercepayments.PaymentMethodTokenizationResponse();
        paymentMethodTokenizationResponse.setGatewayTokenEncrypted(token);
        authResponse.setPaymentMethodTokenizationResponse(paymentMethodTokenizationResponse);

        return authResponse;
    }

    public commercepayments.GatewayResponse createCaptureResponse(commercepayments.CaptureRequest captureRequest) {

        Boolean isMultiCurrencyEnabled = UserInfo.isMultiCurrencyOrganization();
        // get the GatewayAuthCode
        QueryUtils q = new QueryUtils(PaymentAuthorization.SObjectType);
        q.getSelectClause().addField('GatewayAuthCode', false);
        if (isMultiCurrencyEnabled) {
            q.getSelectClause().addField('CurrencyIsoCode', false);
        }
        q.setWhereClause(' WHERE Id =' + '\'' + captureRequest.paymentAuthorizationId + '\'');
        PaymentAuthorization paymentAuthorization = (PaymentAuthorization)Database.query(q.buildSOQL())[0];
        String authCode = paymentAuthorization.GatewayAuthCode;
        String currencyIsoCode;
        if (isMultiCurrencyEnabled) {
            currencyIsoCode = String.valueOf(paymentAuthorization.get('CurrencyIsoCode'));
        } else {
            currencyIsoCode = UserInfo.getDefaultCurrency();
        }
        String amount = toStripeCurrencyUnits(currencyIsoCode, captureRequest.amount);

        Map<String, String> params = new Map<String, String>();
        HttpResponse response;

        if (authCode.startsWith('ch_')) {
            // API: https://stripe.com/docs/api/charges/capture
            params.put('amount', amount);
            response = doPost('charges/' + authCode + '/capture', params);
        } else {
            // https://stripe.com/docs/api/payment_intents/capture
            params.put('amount_to_capture', amount);
            response = doPost('payment_intents/' + authCode + '/capture', params);
        }

        String body = response.getBody();
        if (response.getStatusCode() != 200) {
            return new commercepayments.GatewayErrorResponse('500', 'ERROR: ' + response + ': ' + body);
        }
        Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(body);

        commercepayments.CaptureResponse captureResponse = new commercepayments.CaptureResponse();
        Map<String, Object> charge;
        if (authCode.startsWith('ch_')) {
            charge = results;
        } else {
            Map<String, Object> intent = (Map<String, Object>) JSON.deserializeUntyped(body);
            Map<String, Object> charges = (Map<String, Object>) intent.get('charges');
            Object[] data = (Object[]) charges.get('data');
            charge = (Map<String, Object>) data[0];
        }

        captureResponse.setGatewayResultCode((String) charge.get('balance_transaction'));
        captureResponse.setGatewayResultCodeDescription((String) charge.get('receipt_url'));
        captureResponse.setAmount(fromStripeCurrencyUnits(currencyIsoCode, (Long)charge.get('amount')));
        captureResponse.setGatewayDate(system.now());
        captureResponse.setSalesforceResultCodeInfo(RC_SUCCESS);
        return captureResponse;
    }

    public commercepayments.GatewayResponse createSaleResponse(commercepayments.SaleRequest saleRequest) {
         throw new StripeValidationException('TODO: createSaleResponse');
    }

    public commercepayments.GatewayResponse createRefundResponse(commercepayments.ReferencedRefundRequest refundRequest) {
        // API: https://stripe.com/docs/api/refunds

        Boolean isMultiCurrencyEnabled = UserInfo.isMultiCurrencyOrganization();
        // The Stripe charge ID is stored in the PaymentAuthorization gatewayauthcode
        QueryUtils q = new QueryUtils(Payment.SObjectType);
        q.getSelectClause().addField('PaymentAuthorizationId', false);
        if (isMultiCurrencyEnabled) {
            q.getSelectClause().addField('CurrencyIsoCode', false);
        }
        q.setWhereClause(' WHERE Id =' + '\'' + refundRequest.paymentId + '\'');
        Payment payment = (Payment)Database.query(q.buildSOQL())[0];
        String currencyIsoCode;
        if (isMultiCurrencyEnabled) {
            currencyIsoCode = String.valueOf(payment.get('CurrencyIsoCode'));
        } else {
            currencyIsoCode = UserInfo.getDefaultCurrency();
        }

        QueryUtils q1 = new QueryUtils(PaymentAuthorization.SObjectType);
        q1.getSelectClause().addField('GatewayAuthCode', false);
        q1.setWhereClause(' WHERE Id =' + '\'' + payment.PaymentAuthorizationId + '\'');
        PaymentAuthorization paymentAuth = (PaymentAuthorization)Database.query(q1.buildSOQL())[0];

        String amount = toStripeCurrencyUnits(currencyIsoCode, refundRequest.amount);

        Map<String, String> params = new Map<String, String>();
        if (paymentAuth.GatewayAuthCode.startsWith('pi_')) {
            params.put('payment_intent', paymentAuth.GatewayAuthCode);
        } else {
            params.put('charge', paymentAuth.GatewayAuthCode);
        }
        params.put('amount', amount);

        HttpResponse response = doPost('refunds', params);

        String body = response.getBody();
        if (response.getStatusCode() != 200) {
            return new commercepayments.GatewayErrorResponse('500', 'ERROR: ' + response + ': ' + body);
        }
        Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(body);

        commercepayments.ReferencedRefundResponse refundResponse = new commercepayments.ReferencedRefundResponse();
        refundResponse.setAmount(fromStripeCurrencyUnits(currencyIsoCode, (Long)results.get('amount')));
        refundResponse.setGatewayDate(system.now());
        refundResponse.setGatewayResultCode((String) results.get('balance_transaction'));
        refundResponse.setGatewayResultCodeDescription((String) results.get('receipt_url'));
        refundResponse.setSalesforceResultCodeInfo(RC_SUCCESS);
        return refundResponse;
    }

    public commercepayments.GatewayResponse createAuthReversalResponse(commercepayments.AuthorizationReversalRequest request) {
        //  https://stripe.com/docs/refunds#canceling-a-paymentintent

        QueryUtils q = new QueryUtils(PaymentAuthorization.SObjectType);
        q.getSelectClause().addField('GatewayAuthCode', false);
        q.setWhereClause(' WHERE Id =' + '\'' + request.PaymentAuthorizationId + '\'');
        PaymentAuthorization paymentAuth = (PaymentAuthorization)Database.query(q.buildSOQL())[0];

        commercepayments.AuthorizationReversalResponse authReversalResponse = new commercepayments.AuthorizationReversalResponse();

        if (paymentAuth.GatewayAuthCode.startsWith('pi_')) {
            String path = 'payment_intents/' + paymentAuth.GatewayAuthCode + '/cancel';
            Map<String, String> params = new Map<String, String>();
            HttpResponse response = doPost(path, params);

            String body = response.getBody();
            if (response.getStatusCode() != 200) {
                return new commercepayments.GatewayErrorResponse('500', 'ERROR: ' + response + ': ' + body);
            }
            Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(body);

            authReversalResponse.setGatewayDate(system.now());
            authReversalResponse.setGatewayResultCode((String) results.get('status'));
            authReversalResponse.setGatewayResultCodeDescription((String) results.get('status'));
            authReversalResponse.setSalesforceResultCodeInfo(RC_SUCCESS);
        }
        else {
            return new commercepayments.GatewayErrorResponse('400', 'Authorization reversal can only be performed on a payment intent.');
        }

        return authReversalResponse;
    }

    private static HttpResponse doPost(String path, Map<String, String> params) {
        commercepayments.PaymentsHttp http = new commercepayments.PaymentsHttp();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('/v1/' + path);

        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setBody(urlEncodedParams(params));

        return http.send(request);
    }

    private static HttpResponse doGet(String path) {
        commercepayments.PaymentsHttp http = new commercepayments.PaymentsHttp();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('/v1/' + path);

        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        return http.send(request);
    }

    private static String urlEncodedParams(Map<String, String> params) {
        String body = '';
        Boolean first = true;
        for (String key: params.keySet()) {
            if (first) {
                first = false;
            } else {
                body += '&';
            }
            // NOTE: do not encode values to allow PaymentsNamedConnection to replace the secure fields
            // values that need to be encoded should be encoded by this method's caller
            body += urlEncode(key) + '=' + params.get(key);
        }
        return body;
    }

    private static String urlEncode(String str) {
        return EncodingUtil.urlEncode(str, 'UTF-8');
    }

    private static String toStripeCurrencyUnits(String currencyIsoCode, Double amount) {
        // see https://stripe.com/docs/currencies#zero-decimal

        String currencyCodeLC = currencyIsoCode.toLowercase();
        Decimal decimalScaledAmount = Decimal.ValueOf(amount).setScale(2);

        if (ZERO_DECIMAL_CURRENCY.contains(currencyCodeLC)) {
            return String.ValueOf((amount).intValue());
        } else if (currencyCodeLC.equals('huf')) {
            return String.ValueOf((decimalScaledAmount * 100).intValue());
        }

        return String.ValueOf((decimalScaledAmount * 100).intValue());
    }

    private static Double fromStripeCurrencyUnits(String currencyIsoCode, Long amount) {

        if (ZERO_DECIMAL_CURRENCY.contains(currencyIsoCode.toLowercase())) {
            return (Double)amount;
        }

        return ((Double)amount / 100.0);
    }

    private static commercepayments.SalesforceResultCodeInfo toCodeInfo(commercepayments.SalesforceResultCode code) {
        return new commercepayments.SalesforceResultCodeInfo(code);
    }


    /**
    * Client side
    **/
    global String getClientComponentName(){
        return 'c/stripeCardElement';
    }

    global Map<String, String> getClientConfiguration(){
        Map<String, String> configuration = new Map<String, String>();
        Stripe_Client_Configuration__mdt config = [SELECT publishableAPIKey__c FROM Stripe_Client_Configuration__mdt][0];
        configuration.put('publishableAPIKey', config.publishableAPIKey__c);
        return configuration;
    }

    global commercepayments.ClientResponse processClientRequest(commercepayments.ClientRequestContext context, Map<String, Object> paymentsData){
        Decimal amount = context.getAmount();
        String currencyCode = context.getCurrencyCode();
        String gatewayToken = context.getGatewayToken();
        String idempotencyKey = context.getIdempotencyKey();
        String paymentGatewayId = context.getPaymentGatewayId();

        boolean updateIntent = false;
 
        /*
         * Get name of Payment Gateway Adapter stored in NamedCredential
         */
        String namedCredential = [select DeveloperName 
                                  from NamedCredential 
                                  where Id in 
                                      (select MerchantCredentialId 
                                       from PaymentGateway 
                                       where Id = :paymentGatewayId
                                      )
                                 ].DeveloperName;
        
        String amountValue = toStripeCurrencyUnits(currencyCode, amount.doubleValue());
        // If gatewayToken is provided, query for the intent
        if(!String.isEmpty(gatewayToken)){
            String path = 'payment_intents/'+gatewayToken;
            HttpResponse response = doGetClientSide(path, namedCredential);
            String body = response.getBody();
            Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(body);
            Integer sc = response.getStatusCode();
            // if intent already exists, update when possible
            if (sc >= 200 && sc < 300
                && results.get('id') != null && gatewayToken.equals((String) results.get('id'))) {
                    // If amount has not changed, return response. Update intent if amount has changed
                    if(results.get('currency') != null && currencyCode.equalsIgnoreCase((String) results.get('currency'))
                           && results.get('amount') != null
                           && String.valueOf(results.get('amount')).equals(amountValue)){
                           return new commercepayments.ClientResponse(gatewayToken, results);
                    }else{
                        updateIntent = true;
                        //TODO: handle edge case - cannot update when intent is authorized but amount has changed
                    }
            }
        }

        // Create or Update intent
        Map<String, String> reqParams = new Map<String, String>();
        for (String key : paymentsData.keySet()) {
            reqParams.put(key, String.valueOf(paymentsData.get(key)));
        }
        // Set capture method for creating new intent
        if (!updateIntent) {
            reqParams.put('capture_method', 'manual');
        }
        reqParams.put('currency', currencyCode);
        reqParams.put('amount', amountValue);
        String path = 'payment_intents' + (updateIntent ? '/' + gatewayToken : '');
        HttpResponse response = doPostClientSide(path, namedCredential, reqParams, idempotencyKey);
        String paymentIntentId;
        if (response.getStatusCode() != 200) {
            System.debug('error: ' + response.getStatusCode() + ': ' + response.getStatus());
            Map<String, Object> error = new Map<String, Object>();
            error.put('statusCode', response.getStatusCode());
            error.put('status', response.getStatus());
            error.put('body', response.getBody());
            return new commercepayments.ClientResponse('', error);
        }
        Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        if(responseBody.get('id') != null){
            paymentIntentId = (String)responseBody.get('id');
        }
        return new commercepayments.ClientResponse(paymentIntentId, responseBody);
    }

    private static HttpResponse doPostClientSide(String path, String namedCredential, Map<String, String> params, String idempotencyKey) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:' + namedCredential + '/v1/' + path);
        if(!String.isEmpty(idempotencyKey)){
            request.setHeader('Idempotency-Key', idempotencyKey);
        }
        Blob headerValue = Blob.valueOf('{!$Credential.Username}');
        String authorizationHeader = 'Basic ' + EncodingUtil.base64Encode(headerValue);
        request.setHeader('Authorization', authorizationHeader);

        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setBody(urlEncodedParams(params));

        return http.send(request);
    }

    private static HttpResponse doGetClientSide(String path, String namedCredential) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:' + namedCredential + '/v1/' + path);
        Blob headerValue = Blob.valueOf('{!$Credential.Username}');
        String authorizationHeader = 'Basic ' + EncodingUtil.base64Encode(headerValue);
        request.setHeader('Authorization', authorizationHeader);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        return http.send(request);
    }


}