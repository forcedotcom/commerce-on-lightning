@isTest
public class B2CTaxSampleTest {
    @testSetup static void setup() {
        Account account = new Account(Name='TestAccount');
        insert account;
        WebStore webStore = new WebStore(Name='TestWebStore', SupportedLanguages='en_US', DefaultLanguage='en_US');
        insert webStore;
        WebCart cart = new WebCart(Name='Cart', WebStoreId=webStore.Id, AccountId=account.Id);
        insert cart;
        CartDeliveryGroup cartDeliveryGroup = new CartDeliveryGroup(CartId=cart.Id, Name='Default Delivery');
        insert cartDeliveryGroup;

        CartItem cartItem = new CartItem(
            CartId=cart.Id,
            Sku='SKU_Test1',
            Quantity=3.0,
            Type='Product',
            Name='TestProduct',
            CartDeliveryGroupId=cartDeliveryGroup.Id
        );
        insert cartItem;
    }

    @isTest static void testCartTaxForCartItemSuccessfullyInserted() {
        Test.startTest();
        // Test: execute the integration for the test cart ID.
        B2CTaxSample apexSample = new B2CTaxSample();
        Id webCartId = [SELECT Id FROM WebCart WHERE Name = 'Cart' LIMIT 1].Id;
        Id cartItemId = [SELECT Id FROM CartItem WHERE CartId = :webCartId LIMIT 1].Id;
        sfdc_checkout.IntegrationStatus integrationResult = apexSample.startCartProcessAsync(null, webCartId);

        // Verify: the integration executed successfully
        // and the new CartTax record is inserted.
        System.assertEquals(sfdc_checkout.IntegrationStatus.Status.SUCCESS, integrationResult.status);
        List<CartTax> cartTaxesForCartItem = [SELECT Id FROM CartTax WHERE CartItemId = :cartItemId];
        System.assertEquals(1, cartTaxesForCartItem.size());
        Test.stopTest();
    }

    @isTest static void testProductsWithNoSkuHasError() {
        Test.startTest();
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name = 'Cart' LIMIT 1];
        List<CartDeliveryGroup> cartDeliveryGroups = [SELECT Id FROM CartDeliveryGroup WHERE CartId = :webCart.Id LIMIT 1];

        // Insert a cart item without a SKU
        CartItem cartItemWithNoSku = new CartItem(
            CartId=webCart.Id,
            Quantity=1.0,
            Type='Product',
            Name='TestProductNoSku',
            CartDeliveryGroupId=cartDeliveryGroups.get(0).Id
        );
        insert cartItemWithNoSku;

        B2CTaxSample apexSample = new B2CTaxSample();
        sfdc_checkout.IntegrationInfo integInfo = new sfdc_checkout.IntegrationInfo();
        integInfo.jobId = null;
        sfdc_checkout.IntegrationStatus integrationResult = apexSample.startCartProcessAsync(integInfo, webCart.Id);

        // Validate: IntegrationStatus.Status is FAILED.
        // and a new CartValidationOutput record with level 'Error' was created.
        System.assertEquals(sfdc_checkout.IntegrationStatus.Status.FAILED, integrationResult.status);
        List<CartValidationOutput> cartValidationOutputs = [SELECT Id, Message FROM CartValidationOutput WHERE Level = 'Error'];
        System.assertEquals(1, cartValidationOutputs.size());

        // Validate: The sample text that a product SKU is missing is returned as the failure output
        System.assertEquals('The SKUs for all products in your cart must be defined.', cartValidationOutputs.get(0).Message);
        Test.stopTest();

        // Remove the invalid cart item
        delete cartItemWithNoSku;
    }
}
