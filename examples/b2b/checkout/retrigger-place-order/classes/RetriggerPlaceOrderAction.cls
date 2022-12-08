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

        //The ProcessException attachedToId is used as a basis for comparing
        if(sObjName != null && sObjName.equalsIgnoreCase('Order')){
            List<CartCheckoutSession> sessions = [Select WebCartId from CartCheckoutSession where OrderId = :cartOrOrderId];
            if(sessions != null || sessions.size() != 0){
              CartCheckoutSession existingSession = sessions[0];
              Id webCartId =existingSession.WebCartId;
              String orderReferenceNumber =invokeReferenceApi(cartOrOrderId);
              results.add(orderReferenceNumber);
            }
        }
        if(sObjName != null && sObjName.equalsIgnoreCase('WebCart')){
            String orderReferenceNumber =invokeReferenceApi(cartOrOrderId);
            results.add(orderReferenceNumber);
        }
        return results;
    }

    global static String invokeReferenceApi(Id webCartId){
      String orderReferenceNumber = null;
      List<WebCart> webcart = [Select Status from WebCart where id = :webCartId];
      if(webcart != null || webcart.size() != 0){
        WebCart currentWebCart = webcart[0];
        if(currentWebCart.Status.equalsIgnoreCase('PendingClosed')){
          orderReferenceNumber = Sfdc_Checkout.CheckoutOrderService.cartToOrderSummary(webCartId);
          }
       }
        return orderReferenceNumber;
    }
}