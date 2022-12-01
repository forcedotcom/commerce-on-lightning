global class RetriggerPlaceOrderAction {
    
    @InvocableMethod(callout=false label='Create Order and order summary for Cart' description='Create order and order summary' category='Commerce')
    global static List<String> retriggerPlaceOrder(List<ID> cartOrorderIds) {
        if (cartOrorderIds == null || cartOrorderIds.size() != 1) {
            String errorMessage = 'Invalid parameter in retriggerPlaceOrder';
            throw new IllegalArgumentException (errorMessage);
        }
        
        Id cartOrorderId = cartOrorderIds[0];
        String sObjName = cartOrorderId.getSObjectType().getDescribe().getName();
        List<String> results = new List<String>();
        if(sObjName.equalsIgnoreCase('Order')){
            List<CartCheckoutSession> sessions = [Select WebCartId from CartCheckoutSession where OrderId = :cartOrorderId];
       		CartCheckoutSession existingSession = sessions[0];
            String orderReferenceNumber = Sfdc_Checkout.CheckoutOrderService.cartToOrderSummary(existingSession.WebCartId);
            results.add(orderReferenceNumber);
        }
        if(sObjName.equalsIgnoreCase('WebCart')){
             String orderReferenceNumber = Sfdc_Checkout.CheckoutOrderService.cartToOrderSummary(cartOrorderId);
        	results.add(orderReferenceNumber);
        }
        return results;
    }
 
}