// This must implement the sfdc_checkout.CartShippingCharges interface
// in order to be processed by the checkout flow for the "Shipping" integration

global class B2CDeliverySample implements sfdc_checkout.CartShippingCharges {
    // You MUST change this to be your service or you must launch your own Heroku Service
    // and add the host in Setup | Security | Remote site settings.
    private static String httpHost = 'https://example.com';
    private static Boolean useHTTPService = false;
    global sfdc_checkout.IntegrationStatus startCartProcessAsync(sfdc_checkout.IntegrationInfo jobInfo, Id cartId) {
        sfdc_checkout.IntegrationStatus integStatus = new sfdc_checkout.IntegrationStatus();
        try {
            // In the Winter '21 release there should be two delivery groups per cart.
            // We need to get the ID of the cart delivery group in order to create the cart delivery group methods.
            Id cartDeliveryGroupId = [SELECT CartDeliveryGroupId FROM CartItem WHERE CartId = :cartId][0].CartDeliveryGroupId;

            // Get the shipping options from an external service.
            // We're getting information like rates and carriers from this external service.
            String siteLanguage = jobInfo.siteLanguage;

            // Following snippet of code fetches a static json response with 2 mocked sample shipping methods.
            // Another example that demonstrates how to call a live 3rd party HTTP Service to fetch the desired response is implemented
            // in getShippingOptionsAndRatesFromExternalService method.

            // Both implementations are just samples returning hardcoded Shipping options and MUST not be used in production systems.
            ShippingOptionsAndRatesFromExternalService[] shippingOptionsAndRatesFromExternalService = null;
            if(useHTTPService) {
                shippingOptionsAndRatesFromExternalService = getShippingOptionsAndRatesFromExternalService(siteLanguage);
            } else {
                shippingOptionsAndRatesFromExternalService = getShippingOptionsAndRatesFromMockedService(siteLanguage);
            }

            // On re-entry of the checkout flow delete all previous CartDeliveryGroupMehods for the given cartDeliveryGroupId
            delete [SELECT Id FROM CartDeliveryGroupMethod WHERE CartDeliveryGroupId = :cartDeliveryGroupId];

            // Create a CartDeliveryGroupMethod record for every shipping option returned from the external service
            for (ShippingOptionsAndRatesFromExternalService shippingOption: shippingOptionsAndRatesFromExternalService) {
               populateCartDeliveryGroupMethodWithShippingOptions(shippingOption, cartDeliveryGroupId, cartId);
            }
            // If everything works well, the charge is added to the cart and our integration has been successfully completed.
            integStatus.status = sfdc_checkout.IntegrationStatus.Status.SUCCESS;

        // For testing purposes, this example treats exceptions as user errors, which means they are displayed to the buyer user.
        // In production you probably want this to be an admin-type error. In that case, throw the exception here
        // and make sure that a notification system is in place to let the admin know that the error occurred.
        // See the readme section about error handling for details about how to create that notification.
        } catch (DmlException de) {
            // Catch any exceptions thrown when trying to insert the shipping charge to the CartItems
            Integer numErrors = de.getNumDml();
            String errorMessage = 'There were ' + numErrors + ' errors when trying to insert the charge in the CartDeliveryGroupMethod: ';
            for(Integer errorIdx = 0; errorIdx < numErrors; errorIdx++) {
                errorMessage += 'Field Names = ' + de.getDmlFieldNames(errorIdx);
                errorMessage += 'Message = ' + de.getDmlMessage(errorIdx);
                errorMessage += ' , ';
            }
            return integrationStatusFailedWithCartValidationOutputError(
                integStatus,
                errorMessage,
                jobInfo,
                cartId
            );
        } catch(Exception e) {
            return integrationStatusFailedWithCartValidationOutputError(
                integStatus,
                'An exception occurred during Shipping Calculation.',
                jobInfo,
                cartId
            );
        }
        return integStatus;
    }

    /**
        This method provides a sample of how to call an external service to retrieve Shipping Options.
        The heroku servie called in this method is just a reference implementation that responds back with
        a sample response and MUST not be used in production systems.
     */
    private ShippingOptionsAndRatesFromExternalService[] getShippingOptionsAndRatesFromExternalService (String siteLanguage) {
        ShippingOptionsAndRatesFromExternalService[] shippingOptions = new List<ShippingOptionsAndRatesFromExternalService>();
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        Integer successfulHttpRequest = 200;
        request.setEndpoint(httpHost + '/calculate-shipping-rates-winter-21-with-lang?lang=' + siteLanguage);
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        // If the request is successful, parse the JSON response.
        // The response looks like this:
        // [{"status":"calculated","rate":{"name":"Delivery Method 1","serviceName":"Test Carrier 1","serviceCode":"SNC9600","shipmentCost":11.99,"otherCost":5.99}},
        // {"status":"calculated","rate":{"name":"Delivery Method 2","serviceName":"Test Carrier 2","serviceCode":"SNC9600","shipmentCost":15.99,"otherCost":6.99}}]
        if (response.getStatusCode() == successfulHttpRequest) {
           List<Object> results = (List<Object>) JSON.deserializeUntyped(response.getBody());
           for (Object result: results) {
                Map<String, Object> subresult = (Map<String, Object>) result;
                Map<String, Object> providerAndRate = (Map<String, Object>) subresult.get('rate');
                shippingOptions.add( new ShippingOptionsAndRatesFromExternalService(
                    (String) providerAndRate.get('name'),
                    (String) providerAndRate.get('serviceCode'),
                    (Decimal) providerAndRate.get('shipmentCost'),
                    (Decimal) providerAndRate.get('otherCost'),
                    (String) providerAndRate.get('serviceName'),
                    (String) providerAndRate.get('serviceName'),
                    (String) providerAndRate.get('serviceCode'),
                    generateRandomString(10),
                    true
                ));
            }
            return shippingOptions;
        } else if(response.getStatusCode() == 404) {
            throw new CalloutException ('404. You must create a sample application or add your own service which returns a valid response');
        } else {
            throw new CalloutException ('There was a problem with the request. Error: ' + response.getStatusCode());
        }
    }

    /**
        This method provides an alternative to retrieve Shipping Options if http call needs to be bypassed.
        This method uses a hardcoded sample response and MUST not be used in production systems.
     */
    private ShippingOptionsAndRatesFromExternalService[] getShippingOptionsAndRatesFromMockedService (String siteLanguage) {
        ShippingOptionsAndRatesFromExternalService[] shippingOptions = new List<ShippingOptionsAndRatesFromExternalService>();
        String responseBody = getShippingOptionsResponse(siteLanguage);
        List<Object> results = (List<Object>) JSON.deserializeUntyped(responseBody);
        for (Object result: results) {
            Map<String, Object> subresult = (Map<String, Object>) result;
            Map<String, Object> providerAndRate = (Map<String, Object>) subresult.get('rate');
            shippingOptions.add( new ShippingOptionsAndRatesFromExternalService(
                (String) providerAndRate.get('name'),
                (String) providerAndRate.get('serviceCode'),
                (Decimal) providerAndRate.get('shipmentCost'),
                (Decimal) providerAndRate.get('otherCost'),
                (String) providerAndRate.get('serviceName'),
                (String) providerAndRate.get('serviceName'),
                (String) providerAndRate.get('serviceCode'),
                generateRandomString(10),
                true
            ));
        }
        return shippingOptions;
    }

    private static String generateRandomString(Integer len) {
        final String chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        String randStr = '';
        while (randStr.length() < len) {
        Integer idx = Math.mod(Math.abs(Crypto.getRandomInteger()), chars.length());
        randStr += chars.substring(idx, idx+1);
        }
        return randStr; 
    }

    private String getShippingOptionsResponse(String siteLanguage) {
        String name1, name2, serviceName1, serviceName2;
        if(siteLanguage == 'de') {
            name1 = 'Liefermethode 1';
            name2 = 'Liefermethode 2';
            serviceName1 = 'Testträger 1';
            serviceName2 = 'Testträger 2';
        } else if(siteLanguage == 'ja') {
            name1 = '配送方法1';
            name2 = '配送方法2';
            serviceName1 = 'テストキャリア1';
            serviceName2 = 'テストキャリア2';
        } else {
            name1 = 'Delivery Method 1';
            name2 = 'Delivery Method 2';
            serviceName1 = 'Test Carrier 1';
            serviceName2 = 'Test Carrier 2';
        }
        return '[{"status":"calculated","rate":{"name":"'+name1+'","serviceName":"'+serviceName1+'","serviceCode":"SNC9600","shipmentCost":11.99,"otherCost":5.99}},{"status":"calculated","rate":{"name":"'+name2+'","serviceName":"'+serviceName2+'","serviceCode":"SNC9600","shipmentCost":15.99,"otherCost":6.99}}]';
    }

    // Structure to store the shipping options retrieved from external service.
    Class ShippingOptionsAndRatesFromExternalService {
        private String name;
        private String provider;
        private Decimal rate;
        private Decimal otherCost;
        private String serviceName;
        private String carrier;
        private String classOfService;
        private String referenceNumber;
        private Boolean isActive;

        public ShippingOptionsAndRatesFromExternalService() {
            name = '';
            provider = '';
            rate = 0.0;
            serviceName = '';
            otherCost = 0.0;
            carrier = '';
            classOfService = '';
            referenceNumber = '';
            isActive = true;
        }

        public ShippingOptionsAndRatesFromExternalService(String someName, String someProvider, Decimal someRate, Decimal someOtherCost, String someServiceName,
                String someCarrier, String someClassOfService, String someReferenceNumber, Boolean someIsActive) {
            name = someName;
            provider = someProvider;
            rate = someRate;
            otherCost = someOtherCost;
            serviceName = someServiceName;
            carrier = someCarrier;
            classOfService = someClassOfService;
            referenceNumber = someReferenceNumber;
            isActive = someIsActive;
        }

        public String getProvider() { return provider; }
        public Decimal getRate() { return rate; }
        public Decimal getOtherCost() { return otherCost; }
        public String getServiceName() { return serviceName; }
        public String getName() { return name; }
        public String getCarrier() { return carrier; }
        public String getClassOfService() { return classOfService; }
        public String getReferenceNumber() { return referenceNumber; }
        public Boolean isActive() { return isActive; }
    }

    // Create a CartDeliveryGroupMethod record for every shipping option returned from the external service
    private void populateCartDeliveryGroupMethodWithShippingOptions(ShippingOptionsAndRatesFromExternalService shippingOption,
                                                                  Id cartDeliveryGroupId,
                                                                  Id webCartId){
        // When inserting a new CartDeliveryGroupMethod, the following fields have to be populated:
        // CartDeliveryGroupId: Id of the delivery group of this shipping option
        // ExternalProvider: Unique identifier of shipping provider
        // Name: Name of the CartDeliveryGroupMethod record
        // ShippingFee: The cost of shipping for the delivery group
        // WebCartId: Id if the cart that the delivery group belongs to
        // Carrier: Shipping Carrier e.g. UPS, FedEx etc.
        // ClassOfService: Service e.g. 2 Day Ground, Overnight etc.
        // Product: Product Id for this Shipping Charge
        // ReferenceNumber: Reference Number from External Service
        // IsActive: If this Option is Active
        Id productId = getDefaultShippingChargeProduct2Id();
        //String cartCurrency = [SELECT CurrencyIsoCode FROM WebCart WHERE Id = :webCartId][0].CurrencyIsoCode;
        CartDeliveryGroupMethod cartDeliveryGroupMethod = new CartDeliveryGroupMethod(
            CartDeliveryGroupId = cartDeliveryGroupId,
            //CurrencyIsoCode = cartCurrency,
            ExternalProvider = shippingOption.getProvider(),
            Name = shippingOption.getName(),
            ShippingFee = shippingOption.getRate(),
            WebCartId = webCartId,
            Carrier = shippingOption.getCarrier(),
            ClassOfService = shippingOption.getClassOfService(),
            ProductId = productId,
            ReferenceNumber = shippingOption.getReferenceNumber(),
            IsActive = shippingOption.isActive()
        );
        insert(cartDeliveryGroupMethod);
    }

    private sfdc_checkout.IntegrationStatus integrationStatusFailedWithCartValidationOutputError(
        sfdc_checkout.IntegrationStatus integrationStatus, String errorMessage, sfdc_checkout.IntegrationInfo jobInfo, Id cartId) {
            integrationStatus.status = sfdc_checkout.IntegrationStatus.Status.FAILED;
            // In order for the error to be propagated to the user, we need to add a new CartValidationOutput record.
            // The following fields must be populated:
            // BackgroundOperationId: Foreign Key to the BackgroundOperation
            // CartId: Foreign key to the WebCart that this validation line is for
            // Level (required): One of the following - Info, Error, or Warning
            // Message (optional): Message displayed to the user
            // Name (required): The name of this CartValidationOutput record. For example CartId:BackgroundOperationId
            // RelatedEntityId (required): Foreign key to WebCart, CartItem, CartDeliveryGroup
            // Type (required): One of the following - SystemError, Inventory, Taxes, Pricing, Shipping, Entitlement, Other
            CartValidationOutput cartValidationError = new CartValidationOutput(
                BackgroundOperationId = jobInfo.jobId,
                CartId = cartId,
                Level = 'Error',
                Message = errorMessage.left(255),
                Name = (String)cartId + ':' + jobInfo.jobId,
                RelatedEntityId = cartId,
                Type = 'Shipping'
            );
            insert(cartValidationError);
            return integrationStatus;
    }

    private Id getDefaultShippingChargeProduct2Id() {
        // In this example we will name the product representing shipping charges 'Shipping Charge'.
        // Check to see if a Product2 with that name already exists.
        // If it doesn't exist, create one.
        String shippingChargeProduct2Name = 'Shipping Charge';
        List<Product2> shippingChargeProducts = [SELECT Id FROM Product2 WHERE Name = :shippingChargeProduct2Name];
        if (shippingChargeProducts.isEmpty()) {
            Product2 shippingChargeProduct = new Product2(
                isActive = true,
                Name = shippingChargeProduct2Name
            );
            insert(shippingChargeProduct);
            return shippingChargeProduct.Id;
        } else {
            return shippingChargeProducts[0].Id;
        }
    }
}
