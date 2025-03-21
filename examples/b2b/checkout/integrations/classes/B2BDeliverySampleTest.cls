@isTest
private class B2BDeliverySampleTest {
    @testSetup static void setup() {
        Account testAccount = new Account(Name='TestAccount');
        insert testAccount;
        WebStore testWebStore = new WebStore(Name='TestWebStore', SupportedLanguages='en_US', DefaultLanguage='en_US');
        insert testWebStore;

        Account account = [SELECT Id FROM Account WHERE Name='TestAccount' LIMIT 1];
        WebStore webStore = [SELECT Id FROM WebStore WHERE Name='TestWebStore' LIMIT 1];
        WebCart cart = new WebCart(Name='Cart', WebStoreId=webStore.Id, AccountId=account.Id);
        insert cart;

        CartDeliveryGroup cartDeliveryGroup = new CartDeliveryGroup(CartId=cart.Id, Name='Default Delivery 1');
        insert cartDeliveryGroup;

        CartItem cartItem = new CartItem(CartId=cart.Id, Type='Product', Name='TestProduct', CartDeliveryGroupId=cartDeliveryGroup.Id);
        insert cartItem;
    }


    @isTest static void testIntegrationRunsSuccessfully() {
        Test.startTest();
        // Test: execute the integration for the test cart ID.
        B2BDeliverySample apexSample = new B2BDeliverySample();
        sfdc_checkout.IntegrationInfo integInfo = new sfdc_checkout.IntegrationInfo();
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name='Cart' LIMIT 1];
        integInfo.jobId = null;
        sfdc_checkout.IntegrationStatus integrationResult = apexSample.startCartProcessAsync(integInfo, webCart.Id);
        // Verify: the integration executed successfully
        System.assertEquals(sfdc_checkout.IntegrationStatus.Status.SUCCESS, integrationResult.status);
        Test.stopTest();
    }

    @isTest static void testIntegrationRunsSuccessfully_toRetainPrevSelectedDeliveryMethod() {
        Test.startTest();
        // Test: execute the integration for the test cart ID.
        B2BDeliverySample apexSample = new B2BDeliverySample();
        sfdc_checkout.IntegrationInfo integInfo = new sfdc_checkout.IntegrationInfo();
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name='Cart' LIMIT 1];
        integInfo.jobId = null;
        sfdc_checkout.IntegrationStatus integrationResult = apexSample.startCartProcessAsync(integInfo, webCart.Id);
        // Verify: the integration executed successfully
        System.assertEquals(sfdc_checkout.IntegrationStatus.Status.SUCCESS, integrationResult.status);

        //Till here first run completed and we got some selected delivery method for each Delivery group
        //now we will update our selected delivery method and rerun the calculations and check even post completion of intgration our selected DM should remain same

        //fetch all cart delivery groups
        List<CartDeliveryGroup> cartDeliveryGroups = new List<CartDeliveryGroup>([SELECT Id FROM CartDeliveryGroup WHERE CartId = :webCart.Id]);

        //fetch selected delivery method id for first cdg
        Id previousSelectDeliveryMethodId = [SELECT SelectedDeliveryMethodId FROM CartDeliveryGroup WHERE Id = :cartDeliveryGroups[0].Id][0].SelectedDeliveryMethodId;

        //find delivery method for same delivery group where id does not match with previous selected DM
        List<CartDeliveryGroupMethod> cartDeliveryGroupMethods = new List<CartDeliveryGroupMethod>([SELECT Id FROM cartDeliveryGroupMethod WHERE CartDeliveryGroupId = :cartDeliveryGroups[0].Id]);
        String nonSelectedId = null;
        for( CartDeliveryGroupMethod cdgm : cartDeliveryGroupMethods) {
            if(cdgm.Id != previousSelectDeliveryMethodId) {
                 nonSelectedId = cdgm.Id;
                 break;
            }
        }

        //update cart delivery group with updated DM
        CartDeliveryGroup cdgToUpdate = cartDeliveryGroups[0];
        cdgToUpdate.SelectedDeliveryMethodId = nonSelectedId;
        update cdgToUpdate;

        // run integration again
        integInfo.jobId = null;
        integrationResult = apexSample.startCartProcessAsync(integInfo, webCart.Id);
        // Verify: the integration executed successfully
        System.assertEquals(sfdc_checkout.IntegrationStatus.Status.SUCCESS, integrationResult.status);

        //fetch all cart delivery groups
        cartDeliveryGroups = new List<CartDeliveryGroup>([SELECT Id FROM CartDeliveryGroup WHERE CartId = :webCart.Id]);
        //update cart delivery group with updated DM
        cdgToUpdate = cartDeliveryGroups[0];
        cdgToUpdate.DeliverToPostalCode = '100001';
        update cdgToUpdate;

        // run integration again
        integInfo.jobId = null;
        integrationResult = apexSample.startCartProcessAsync(integInfo, webCart.Id);
        // Verify: the integration executed successfully
        System.assertEquals(sfdc_checkout.IntegrationStatus.Status.SUCCESS, integrationResult.status);
        // verify that newPreviousSelectDeliveryMethodId should match with our selected DM id
        Id newPreviousSelectDeliveryMethodId = [SELECT SelectedDeliveryMethodId FROM CartDeliveryGroup WHERE Id = :cartDeliveryGroups[0].Id][0].SelectedDeliveryMethodId;
        System.assertEquals(nonSelectedId, newPreviousSelectDeliveryMethodId);

        Test.stopTest();
    }

}
