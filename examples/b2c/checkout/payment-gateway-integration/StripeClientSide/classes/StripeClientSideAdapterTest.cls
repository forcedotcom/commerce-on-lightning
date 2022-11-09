@isTest
private class StripeClientSideAdapterTest {

    @isTest static void clientConfiguration() {
        Map<String, String> configuration = new StripeClientSideAdapter().getClientConfiguration();
        System.assert(configuration.get('publishableAPIKey') != null);
    }

    /**
     * Directly test the Custom Metadata Type
     */
    @isTest static void clientComponentName() {
        String componentName = new StripeClientSideAdapter().getClientComponentName();
        System.assertEquals('b2c_lite_commerce/stripeCardElement', componentName);
    }
}
