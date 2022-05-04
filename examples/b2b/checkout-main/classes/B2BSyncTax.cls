// Determines the taxes for the cart
public class B2BSyncTax {
    // This invocable method only expects one ID
    @InvocableMethod(callout=true label='Prepare the taxes' description='Runs a synchronous version of taxes' category='B2B Commerce')
    public static void syncTax(List<ID> cartIds) {
        // Validate the input
        if (cartIds == null || cartIds.size() != 1) {
            String errorMessage = 'A cart id must be included to B2BSyncTax'; // Get wording from doc!!!
            // Sync non-user errors skip saveCartValidationOutputError
            throw new CalloutException (errorMessage);
        }
        
        // Extract cart id and start processing
        Id cartId = cartIds[0];
        startCartProcessSync(cartId);
    }

    private static void startCartProcessSync(Id cartId) {
        // In the Spring '20 release, there should be one delivery group per cart.
        // In the future, when multiple delivery groups can be created,
        // this sample should be updated to loop through all delivery groups.

        // We need to get the ID of the delivery group in order to get the DeliverTo info.
        Id cartDeliveryGroupId = [SELECT CartDeliveryGroupId FROM CartItem WHERE CartId = :cartId][0].CartDeliveryGroupId;
        CartDeliveryGroup deliveryGroup = [SELECT DeliverToState, DeliverToCountry FROM CartDeliveryGroup WHERE Id = :cartDeliveryGroupId][0];
        String taxType = [SELECT TaxType FROM WebCart WHERE Id = :cartId][0].TaxType;
        
        // Get all SKUs, the cart item IDs, and the total prices from the cart items.
        Map<String, Id> cartItemIdsBySKU = new Map<String, Id>();
        Map<String, DataToExternalService> cartItemTotalPriceBySKU = new Map<String, DataToExternalService>();
        for (CartItem cartItem : [SELECT Id, Sku, Quantity, TotalLineAmount, AdjustmentAmount, ItemizedAdjustmentAmount, Type FROM CartItem WHERE CartId = :cartId]) {
            String cartItemSKU = '';
            if (cartItem.Type == 'Product') {
                if (String.isBlank(cartItem.Sku)) {
                    String errorMessage = 'The SKUs for all products in your cart must be defined.';
                    saveCartValidationOutputError(errorMessage, cartId);
                    throw new CalloutException (errorMessage);
                }
                cartItemSKU = cartItem.Sku;
            }
            else if (cartItem.Type == 'Charge') {
                // This is an example for a Cart Item of type shipping charge.
                // For simplicity and testing purposes, we just assign some SKU to this charge so that the taxation external service returns some value.
                cartItemSKU = 'ChargeSKU';
            }

            String cartItemId = cartItem.Id;

            cartItemIdsBySKU.put(cartItemSKU, cartItemId);

            List<CIPA> cipaList = new List<CIPA>();
            
            for(CartItemPriceAdjustment cipa : [SELECT Id, TotalAmount FROM CartItemPriceAdjustment WHERE CartItemId = :cartItemId]) {
                cipaList.add(new CIPA(cipa.id, cipa.TotalAmount));
            }
            
            DataToExternalService data = new DataToExternalService(cartItem.Id, cartItemSKU, cartItem.Quantity, cartItem.TotalLineAmount, cartItem.AdjustmentAmount, cipaList);

            cartItemTotalPriceBySKU.put(cartItemSKU, data);
        }      
        
        // Get the tax rates and tax amounts from an external service
        // Other parameters will be passed here, like ship_from, bill_to, more details about the ship_to, etc.
        Map<String, TaxDataFromExternalService> rateAndAmountFromExternalServicePerSku = getTaxRatesAndAmountsFromExternalService(
            cartItemTotalPriceBySKU, deliveryGroup.DeliverToState, deliveryGroup.DeliverToCountry, taxType
        );
        
        // If there are taxes from a previously cancelled checkout, delete them.
        List<Id> cartItemIds = cartItemIdsBySKU.values();
        delete [SELECT Id FROM CartTax WHERE CartItemId IN :cartItemIds];
        
        // For each cart item, insert a new tax line in the CartTax entity.
        // The total tax is automatically rolled up to TotalLineTaxAmount in the corresponding CartItem line.
        CartTax[] cartTaxestoInsert = new CartTax[]{};
        //CartTax[] cartAdjTaxestoInsert = new CartTax[]{};
        for (String sku : cartItemIdsBySKU.keySet()) {
            TaxDataFromExternalService rateAndAmountFromExternalService = rateAndAmountFromExternalServicePerSku.get(sku);
            if (rateAndAmountFromExternalService == null) {
                String errorMessage = 'The product with sku ' + sku + ' could not be found in the external system';
                saveCartValidationOutputError(errorMessage, cartId);
                throw new CalloutException (errorMessage);
            }
            
            // Update CartItem with taxes
            String cartItemIdToUpdate = rateAndAmountFromExternalService.getCartItemId();
            CartItem cartItemToUpdate = [SELECT Id FROM CartItem WHERE Id = :cartItemIdToUpdate][0];
            cartItemToUpdate.AdjustmentTaxAmount = rateAndAmountFromExternalService.getAdjustmentTaxAmount();
            cartItemToUpdate.NetUnitPrice = rateAndAmountFromExternalService.getNetUnitPrice();
            cartItemToUpdate.GrossUnitPrice = rateAndAmountFromExternalService.getGrossUnitPrice();
            update(cartItemToUpdate);
            //System.debug(rateAndAmountFromExternalService);
            // If the sku was found in the external system, add a new CartTax line for that sku
            // The following fields from CartTax can be filled in:
            // Amount (required): Calculated tax amount.
            // CartItemId (required): ID of the cart item.
            // Description (optional): Description of CartTax.
            // Name (required): Name of the tax.
            // TaxCalculationDate (required): Calculation date for this tax line.
            // TaxRate (optional): The percentage value of the tax. Null if the tax is a flat amount.
            // TaxType (required): The type of tax, e.g. Actual or Estimated.
            CartTax tax = new CartTax( 
                Amount = rateAndAmountFromExternalService.getAmount(),
                CartItemId = cartItemIdsBySKU.get(sku),
                Name = rateAndAmountFromExternalService.getTaxName(),
                TaxCalculationDate = Date.today(),
                TaxRate = rateAndAmountFromExternalService.getRate(),
                TaxType = 'Actual'
            );
            
            cartTaxestoInsert.add(tax);
            
            for (CIPATax cipaTax : rateAndAmountFromExternalService.getItemizedPromotionTaxAmounts()) {
                CartTax promoTax = new CartTax( 
                    Amount = cipaTax.getTaxAmount(),
                    CartItemId = cartItemIdsBySKU.get(sku),
                    Name = rateAndAmountFromExternalService.getTaxName(),
                    TaxCalculationDate = Date.today(),
                    TaxRate = rateAndAmountFromExternalService.getRate(),
                    TaxType = 'Actual',
                    CartItemPriceAdjustmentId = cipaTax.getId()
                );
                cartTaxestoInsert.add(promoTax);
            }
        }
        insert(cartTaxestoInsert);
    }
    
    private static Map<String, TaxDataFromExternalService> getTaxRatesAndAmountsFromExternalService (
        Map<String, DataToExternalService> cartItemTotalAmountBySKU, String state, String country, String taxType) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            Integer SuccessfulHttpRequest = 200;
            String encodedState = (state == null) ? '' : EncodingUtil.urlEncode(state, 'UTF-8').replace('+', '%20');
            String encodedCountry = (country == null) ? '' : EncodingUtil.urlEncode(country, 'UTF-8').replace('+', '%20');
            String encodedTaxType = (taxType == null) ? '' : EncodingUtil.urlEncode(taxType, 'UTF-8').replace('+', '%20');
            
            Map<String, DataToExternalService> encodedCartItemTotalAmountBySKU = new Map<String, DataToExternalService>();
            for(String sku: cartItemTotalAmountBySKU.keySet()) {
                encodedCartItemTotalAmountBySKU.put(EncodingUtil.urlEncode(sku, 'UTF-8'), cartItemTotalAmountBySKU.get(sku));
            }
            
            // To access the service below, you may need to add endpoint = https://b2b-commerce-test.herokuapp.com in Setup | Security | Remote site settings.
            String requestURL = 'https://b2b-commerce-test.herokuapp.com/get-tax-rates-with-adjustments?state=' + encodedState
                            + '&country=' + encodedCountry + '&taxType=' + encodedTaxType
                            //+ '&country=' + encodedCountry + '&taxType=' + 'Gross'  
                            + '&amountsBySKU=' + JSON.serialize(encodedCartItemTotalAmountBySKU);
            request.setEndpoint(requestURL);
            request.setMethod('GET');
            HttpResponse response = http.send(request);
        
            // If the request is successful, parse the JSON response;
            // The response includes the tax amount, rate, and name for each SKU. It looks something like this:
            // {"SKU_1_september10-1568355297":{"taxAmount":2.8229012971048855,"taxRate":0.08,"taxName":"GST"},"SKU_0_september10-1568355296":{"taxAmount":5.0479003481482385,"taxRate":0.08,"taxName":"GST"}}
            if (response.getStatusCode() == SuccessfulHttpRequest) {
                Map<String, Object> resultsFromExternalServiceBySKU = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                Map<String, TaxDataFromExternalService> taxDataFromExternalServiceBySKU = new Map<String, TaxDataFromExternalService>();
                for (String sku : resultsFromExternalServiceBySKU.keySet()) {
                    taxDataFromExternalServiceBySKU.put(sku, new TaxDataFromExternalService((Map<String, Object>) resultsFromExternalServiceBySKU.get(sku)));
                }
                return taxDataFromExternalServiceBySKU;
            }
            else {
                String errorMessage = 'There was a problem with the request. Error: ' + response.getStatusCode();
                // Sync non-user errors skip saveCartValidationOutputError
                throw new CalloutException (errorMessage);
            }
    }

    // Structure to store the tax data retrieved from external service
    // This simplifies our ability to access it when storing it in Salesforce's CartTax entity
    Class TaxDataFromExternalService {
        private String cartItemId;
        private Decimal rate;
        private Decimal amount;
        private String taxName;
        private Decimal adjustmentTaxAmount;
        private Decimal totalItemizedPromotionTaxAmount;
        private List<CIPATax> itemizedPromotionTaxAmounts;
        private Decimal grossUnitPrice;
        private Decimal netUnitPrice;
        
        public TaxDataFromExternalService () {
            cartItemId = '';
            rate = 0.0;
            amount = 0.0;
            taxName = '';
            adjustmentTaxAmount = 0.0;
            totalItemizedPromotionTaxAmount = 0.0;
            itemizedPromotionTaxAmounts = new List<CIPATax>();
            grossUnitPrice = 0.0;
            netUnitPrice = 0.0;
        }
        
        public TaxDataFromExternalService (Map<String, Object> rateAndAmountFromExternalService) {
            cartItemId = (String)rateAndAmountFromExternalService.get('cartItemId');
            rate = (Decimal)rateAndAmountFromExternalService.get('taxRate');
            amount = (Decimal)rateAndAmountFromExternalService.get('taxAmount');
            taxName = (String)rateAndAmountFromExternalService.get('taxName');
            adjustmentTaxAmount = (Decimal)rateAndAmountFromExternalService.get('adjustmentTaxAmount');
            totalItemizedPromotionTaxAmount = (Decimal)rateAndAmountFromExternalService.get('totalItemizedPromotionTaxAmount');
            List<Object> itemTaxList = (List<Object>)rateAndAmountFromExternalService.get('itemizedPromotionTaxAmounts');
            itemizedPromotionTaxAmounts = new List<CIPATax>();
            for (Object itemTaxAmt : itemTaxList) {
                Object id = ((Map<String, Object>) itemTaxAmt).get('id');
                Object taxAmt = ((Map<String, Object>) itemTaxAmt).get('taxAmount');
                itemizedPromotionTaxAmounts.add(new CIPATax((String) id, (Decimal) taxAmt));
            }
            grossUnitPrice = (Decimal)rateAndAmountFromExternalService.get('grossUnitPrice');
            netUnitPrice = (Decimal)rateAndAmountFromExternalService.get('netUnitPrice');
        }
        
        public String getCartItemId() {
            return cartItemId;
        }
        
        public Decimal getRate() {
            return rate;
        }
        
        public Decimal getAmount() {
            return amount;
        }
        
        public String getTaxName() {
            return taxName;
        }
        
        public Decimal getAdjustmentTaxAmount() {
            return adjustmentTaxAmount;
        }
        
        public Decimal getTotalItemizedPromotionTaxAmount() {
            return totalItemizedPromotionTaxAmount;
        }

        public List<CIPATax> getItemizedPromotionTaxAmounts() {
            return itemizedPromotionTaxAmounts;
        }
        
        public Decimal getGrossUnitPrice() {
            return grossUnitPrice;
        }
        
        public Decimal getNetUnitPrice() {
            return netUnitPrice;
        }
    }

    // Structure to send to external tax service
    Class CIPATax {
        private String id;
        private Decimal taxAmount;
        
        public CIPATax (String someId, Decimal someTaxAmount) {
            id = someId;
            taxAmount = someTaxAmount;
        }
        
        public String getId() {
            return id;
        }
        
        public Decimal getTaxAmount() {
            return taxAmount;
        }
    }
    
    // Structure to send to external tax service
    Class DataToExternalService {
        private String cartItemId;
        private String sku;
        private Decimal quantity;
        private Decimal amount;
        private Decimal tierAdj;
        private List<CIPA> itemizedPromos;
        
        public DataToExternalService (String someCartItemId, String someSku, Decimal someQuantity, Decimal someAmount, Decimal someTierAdj, List<CIPA> someItemizedPromos) {
            cartItemId = someCartItemId;
            sku = someSku;
            quantity= someQuantity;
            amount = someAmount;
            tierAdj = someTierAdj;
            itemizedPromos = someItemizedPromos;
        }
        
        public String getCartItemId() {
            return cartItemId;
        }
        
        public String getSku() {
            return sku;
        }
        
        public Decimal getQuantity() {
            return quantity;
        }
        
        public Decimal getAmount() {
            return amount;
        }
        
        public Decimal getTierAdj() {
            return tierAdj;
        }
        
        public List<CIPA> getItemizedPromos() {
            return itemizedPromos;
        }
    }

    // Structure to send to external tax service
    Class CIPA {
        private String id;
        private Decimal amount;
        
        public CIPA (String someId, Decimal someAmount) {
            id = someId;
            amount = someAmount;
        }
        
        public String getId() {
            return id;
        }
        
        public Decimal getAmount() {
            return amount;
        }
    }
    
    private static void saveCartValidationOutputError(String errorMessage, Id cartId) {
            // For the error to be propagated to the user, we need to add a new CartValidationOutput record.
            // The following fields must be populated:
            // BackgroundOperationId: Foreign Key to the BackgroundOperation
            // CartId: Foreign key to the WebCart that this validation line is for
            // Level (required): One of the following - Info, Error, or Warning
            // Message (optional): Message displayed to the user (maximum 255 characters)
            // Name (required): The name of this CartValidationOutput record. For example CartId
            // RelatedEntityId (required): Foreign key to WebCart, CartItem, CartDeliveryGroup
            // Type (required): One of the following - SystemError, Inventory, Taxes, Pricing, Shipping, Entitlement, Other
            CartValidationOutput cartValidationError = new CartValidationOutput(
                CartId = cartId,
                Level = 'Error',
                Message = errorMessage.left(255),
                Name = (String)cartId,
                RelatedEntityId = cartId,
                Type = 'Taxes'
            );
            insert(cartValidationError);
    }
}