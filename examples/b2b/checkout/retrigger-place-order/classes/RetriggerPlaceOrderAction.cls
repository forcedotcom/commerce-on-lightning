global class RetriggerPlaceOrderAction {

    @InvocableMethod(callout=false label='Create Order and order summary for Cart' description='Create order and order summary' category='Commerce')
    global static List<String> retriggerPlaceOrder(List<ID> cartOrOrderIds) {
    //The RetriggerPlace Flow invokes this action and it only has one OrderOrCartId
        if (cartOrOrderIds == null || cartOrOrderIds.size() != 1) {
            String errorMessage = 'Invalid parameter in retriggerPlaceOrder';
            throw new IllegalArgumentException (errorMessage);
        }

        Id cartOrOrderId = cartOrOrderIds[0];
        String sObjName = cartOrOrderId.getSObjectType().getDescribe().getName();
        List<String> results = new List<String>();
        if(sObjName != null && sObjName.equalsIgnoreCase('Order')){
            List<CartCheckoutSession> sessions = [Select WebCartId from CartCheckoutSession where OrderId = :cartOrOrderId];
       		  CartCheckoutSession existingSession = sessions[0];
            String orderReferenceNumber = Sfdc_Checkout.CheckoutOrderService.cartToOrderSummary(existingSession.WebCartId);
            results.add(orderReferenceNumber);
        }
        if(sObjName != null && sObjName.equalsIgnoreCase('WebCart')){
             String orderReferenceNumber = Sfdc_Checkout.CheckoutOrderService.cartToOrderSummary(cartOrOrderId);
        	   results.add(orderReferenceNumber);
        }
        return results;
    }

}
