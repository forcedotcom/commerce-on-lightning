# Split Order (Create Fulfillment Orders) flows

The implementation provided in this directory contains flow metadata files that you can deploy to any Salesforce B2B or B2B2C Commerce enabled org. Use these files to set up automatic [Fullfilment Orders](https://help.salesforce.com/s/articleView?id=sf.om_fulfillment_objects.htm&type=5) creation (aka Split Orders) process that will be executed after each creation of the [Order Summary](https://help.salesforce.com/s/articleView?id=sf.om_order_summary_fields.htm&type=5).

## The advantages of using Split Orders Flows:

It will create one [Fulfillment Order](https://help.salesforce.com/s/articleView?id=sf.om_fulfillment_order_fields.htm&type=5) per [Order Delivery Group Summary](https://help.salesforce.com/s/articleView?id=sf.om_order_delivery_group_summary_fields.htm&type=5) from the Order Summary.

## Deploy

This flow will be automatically deployed when using sfdx to set up a B2B or B2B2C store. You may also manually deploy the flow via Workbench or sfdx.
After the flow is deployed, you may update the flow if needed and manually activate it.

### Deploy Using Workbench

1.  Create a .zip file of this directory:
    `zip -r -X <your-zip-file>.zip *`
2.  Open Workbench and go to **migration** -> **Deploy**.
3.  Click **Choose File** and navigate to the .zip file you created ( `<your-zip-file>.zip` ).
4.  Select **Single Package**.
5.  Click **Next**.
6.  Click **Deploy**.

### Deploy Using sfdx

Run `sfdx force:mdapi:deploy -d <path-to-this-directory> -w -1`

## Activate Split Order Flows

Once flows are deployed please open Setup page and select Process Automation -> Flows. Please open each flow and activate it. 
1. [Create OrderSummaryRoutingSchedule on OrderSummary event](flows/Create_OrderSummaryRoutingSchedule_on_OrderSummary_event.flow)
2. [Create Fulfillment Orders on OrderSummaryRoutingSchedule](flows/Create_Fulfillment_Orders_on_OrderSummaryRoutingSchedule.flow) 
3. [Create Fulfillment Orders from Order Summary Subflow](flows/Create_Fulfillment_Orders_from_Order_Summary_Subflow.flow)



