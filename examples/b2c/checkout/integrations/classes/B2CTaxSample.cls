// This must implement the sfdc_checkout.CartTaxCalculations interface
// in order to be processed by the checkout flow and used for your Taxes integration.

global  class B2CTaxSample implements sfdc_checkout.CartTaxCalculations {
    global sfdc_checkout.IntegrationStatus startCartProcessAsync(sfdc_checkout.IntegrationInfo jobInfo, Id cartId) {
        sfdc_checkout.IntegrationStatus integStatus = new sfdc_checkout.IntegrationStatus();
        try {
            // If there are any Products with null SKU throw exception.
            CartItem[] nullSKUs = [SELECT Id FROM CartItem WHERE CartId=:cartId AND Type='Product' AND Sku=null];
            if (!nullSKUs.isEmpty()) {
                String errorMessage = System.Label.ERROR_SKU_NOT_DEFINED;
                return integrationStatusFailedWithCartValidationOutputError(
                    integStatus,
                    errorMessage,
                    jobInfo,
                    cartId
                );
            }

            // In the Spring '20 release, there should be one delivery group per cart.
            // In the future, when multiple delivery groups can be created,
            // this sample should be updated to loop through all delivery groups.
            // We need to get the ID of the delivery group in order to get the DeliverTo info.
            Id cartDeliveryGroupId = [SELECT CartDeliveryGroupId FROM CartItem WHERE CartId = :cartId][0].CartDeliveryGroupId;
            CartDeliveryGroup deliveryGroup = [SELECT DeliverToState, DeliverToCountry FROM CartDeliveryGroup WHERE Id = :cartDeliveryGroupId][0];
            String taxType = [SELECT TaxType FROM WebCart WHERE Id = :cartId][0].TaxType;


            Map<ID, CartItem> cartItemsMap = new Map<ID, CartItem>([SELECT Id, Sku, Quantity, TotalLineAmount, AdjustmentAmount, (Select Id, TotalAmount from CartItemPriceAdjustments) FROM CartItem  WHERE CartId = :cartId]);

            // Get the tax rates and tax amounts from an external service
            // Other parameters will be passed here, like ship_from, bill_to, more details about the ship_to, etc.
            Map<String, Object> dataFromExternalService = getDataFromExternalService(
                cartItemsMap, deliveryGroup.DeliverToState, deliveryGroup.DeliverToCountry, taxType
            );

            // If there are taxes from a previously cancelled checkout, delete them.
            delete [SELECT Id FROM CartTax WHERE CartItemId IN (Select Id FROM CartItem WHERE CartId = :cartId)];

            // For each cart item, insert a new tax line in the CartTax entity.
            // The total tax is automatically rolled up to TotalLineTaxAmount in the corresponding CartItem line.
            CartTax[] cartTaxestoInsert = new CartTax[]{};

            List<CartItem> cartItemsList = new List<CartItem>(cartItemsMap.values());

            for (CartItem cartItemToUpdate : cartItemsList) {
                // Update CartItem with taxes
                String cartItemId = cartItemToUpdate.id;
                Map<String, Object> cartItemsMapFromExternalService = (Map<String, Object>) dataFromExternalService.get(cartItemId);
                cartItemToUpdate.AdjustmentTaxAmount = (Decimal)cartItemsMapFromExternalService.get('adjustmentTaxAmount');
                cartItemToUpdate.NetUnitPrice = (Decimal)cartItemsMapFromExternalService.get('netUnitPrice');
                cartItemToUpdate.GrossUnitPrice = (Decimal)cartItemsMapFromExternalService.get('grossUnitPrice');

                CartTax tax = new CartTax(
                    Amount = (Decimal)cartItemsMapFromExternalService.get('taxAmount'),
                    CartItemId = cartItemId,
                    Name = (String)cartItemsMapFromExternalService.get('taxName'),
                    TaxCalculationDate = Date.today(),
                    TaxRate = (Decimal)cartItemsMapFromExternalService.get('taxRate'),
                    TaxType = 'Actual'
                );
                cartTaxestoInsert.add(tax);

                List<Object> itemTaxList = (List<Object>)cartItemsMapFromExternalService.get('itemizedPromotionTaxAmounts');
                for (Object cipaTax : itemTaxList) {
                    CartTax promoTax = new CartTax(
                        Amount = (Decimal)((Map<String, Object>) cipaTax).get('taxAmount'),
                        CartItemId = cartItemId,
                        Name = (String)cartItemsMapFromExternalService.get('taxName'),
                        TaxCalculationDate = Date.today(),
                        TaxRate = (Decimal)cartItemsMapFromExternalService.get('taxRate'),
                        TaxType = 'Actual',
                        CartItemPriceAdjustmentId = (String)((Map<String, Object>) cipaTax).get('id')
                    );
                    cartTaxestoInsert.add(promoTax);
                }
            }

            update(cartItemsList);
            insert(cartTaxestoInsert);
            integStatus.status = sfdc_checkout.IntegrationStatus.Status.SUCCESS;
        } catch(Exception e) {
            // For testing purposes, this example treats exceptions as user errors, which means they are displayed to the buyer user.
            // In production you probably want this to be an admin-type error. In that case, throw the exception here
            // and make sure that a notification system is in place to let the admin know that the error occurred.
            // See the readme section about error handling for details about how to create that notification.
            return integrationStatusFailedWithCartValidationOutputError(
                integStatus,
                String.format(System.Label.ERROR_EXCEPTION_OCCURRED, new List<String>{ e.getTypeName(), e.getMessage() }),
                jobInfo,
                cartId
            );
        }
        return integStatus;
    }

    private Map<String, Object> getDataFromExternalService (
        Map<ID, CartItem> cartItemsMap, String state, String country, String taxType) {

        String requestURL = 'https://b2b-commerce-test.herokuapp.com/get-tax-rates-with-adjustments-post';
        String requestBody = '{"state":"'+state+'", "country":"'+country+'", "taxType":"'+taxType+'", '+'"amountsBySKU":'+JSON.serialize(cartItemsMap)+'}';
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(requestURL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(requestBody);
        HttpResponse response = http.send(request);

        // If the request is successful, parse the JSON response
        if (response.getStatusCode() == 200) {
            Map<String, Object> resultsFromExternalService = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            return resultsFromExternalService;
        }
        else {
            throw new CalloutException (String.format(System.Label.ERROR_CALLOUT_EXCEPTION, new List<String>{ String.valueOf(response.getStatusCode()) }));
        }
    }

    private sfdc_checkout.IntegrationStatus integrationStatusFailedWithCartValidationOutputError(
        sfdc_checkout.IntegrationStatus integrationStatus, String errorMessage, sfdc_checkout.IntegrationInfo jobInfo, Id cartId) {
            integrationStatus.status = sfdc_checkout.IntegrationStatus.Status.FAILED;
            // For the error to be propagated to the user, we need to add a new CartValidationOutput record.
            // The following fields must be populated:
            // BackgroundOperationId: Foreign Key to the BackgroundOperation
            // CartId: Foreign key to the WebCart that this validation line is for
            // Level (required): One of the following - Info, Error, or Warning
            // Message (optional): Message displayed to the user (maximum 255 characters)
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
                Type = 'Taxes'
            );
            insert(cartValidationError);
            return integrationStatus;
    }
}
