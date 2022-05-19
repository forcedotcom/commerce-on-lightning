global class StripeAdapter implements commercepayments.PaymentGatewayAdapter {

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

    global StripeAdapter() {
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
            } else if (requestType == commercepayments.RequestType.Tokenize) {
                response = createTokenizeResponse((commercepayments.PaymentMethodTokenizationRequest) paymentRequest);
            } else if (requestType == commercepayments.RequestType.AuthorizationReversal) {
                response = createAuthReversalResponse((commercepayments.AuthorizationReversalRequest) paymentRequest);
            }
            return response;
        } catch (StripeValidationException e) {
             return new commercepayments.GatewayErrorResponse('400', e.getMessage());
        }
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
}