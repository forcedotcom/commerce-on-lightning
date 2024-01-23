@isTest
private class B2CDeliverySampleTest {

    static Integer cartDeliveryGroupsNo;
    static Integer expectedCDGMInTheIntegrationMock;

    static void init(){
        cartDeliveryGroupsNo = 4; // This value can be changed as needed
        expectedCDGMInTheIntegrationMock = 2; // This value shall not be changed without matchiing the integration implementation mock
    }

    @testSetup static void setup() {
        init();
        Account testAccount = new Account(Name='TestAccount');
        insert testAccount;
        WebStore testWebStore = new WebStore(Name='TestWebStore', SupportedLanguages='en_US', DefaultLanguage='en_US');
        insert testWebStore;

        Account account = [SELECT Id FROM Account WHERE Name='TestAccount' LIMIT 1];
        WebStore webStore = [SELECT Id FROM WebStore WHERE Name='TestWebStore' LIMIT 1];
        WebCart cart = new WebCart(Name='Cart', WebStoreId=webStore.Id, AccountId=account.Id);
        insert cart;

        for (Integer i = 1; i <= cartDeliveryGroupsNo; i++) {
            CartDeliveryGroup cartDeliveryGroup = new CartDeliveryGroup(CartId=cart.Id, Name='Default Delivery ' + i);
            insert cartDeliveryGroup;

            for (Integer j = 0; j < expectedCDGMInTheIntegrationMock; j++) {
                CartItem cartItem = new CartItem(CartId=cart.Id, Type='Product', Name='TestProduct', CartDeliveryGroupId=cartDeliveryGroup.Id);
                insert cartItem;
            }
        }
    }


    @isTest static void testIntegrationRunsSuccessfully() {
        Test.startTest();
        init();
        // Test: execute the integration for the test cart ID.
        B2CDeliverySample apexSample = new B2CDeliverySample();
        sfdc_checkout.IntegrationInfo integInfo = new sfdc_checkout.IntegrationInfo();
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name='Cart' LIMIT 1];
        integInfo.jobId = null;
        sfdc_checkout.IntegrationStatus integrationResult = apexSample.startCartProcessAsync(integInfo, webCart.Id);
        // Verify: the integration executed successfully
        System.assertEquals(sfdc_checkout.IntegrationStatus.Status.SUCCESS, integrationResult.status);

        List<CartDeliveryGroupMethod> CDGMs = new List<CartDeliveryGroupMethod>([SELECT Id FROM CartDeliveryGroupMethod WHERE WebCartId = :webCart.Id]);
        Integer expectedCDGMs = cartDeliveryGroupsNo * expectedCDGMInTheIntegrationMock;
        System.assertEquals(expectedCDGMs, CDGMs.size(),'(MultipppleDeliveryGroups/MDG support validation) The expected ' + expectedCDGMs + ' CartDeliveryGroupMethods were not created by the integration');

        Test.stopTest();
    }
}
