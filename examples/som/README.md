# Order Management Reference Implementation

Reference Implementation samples for Order Management.

## This repository includes:

1. A flow to approve an order summary record. This flow is set in Draft status as approved orders does not allow cancellation of an item in the order.
2. A flow to fulfill orders for one location, Warehouse.
3. A flow to create an invoice after the order is fulfilled.
4. A flow to cancel an item in the order.
5. A flow to discount an item in the order.
6. A flow to return an item in the order.
7. Actions & Recommendations Deployment for the order summary page, which is named "SOM Actions".

_Note:_ The Cancel, Discount and Return an Item flows are cloned from the default templates that are available in the org.

## Setup

1. Set up order management flows and actions.
    ```bash
    sfdx commerce:ordermanagement:quickstart:setup -u <<ORG_USERNAME>> --json
    ```
2. Add an Actions & Recommendation Deployment to the Order Summary page. You need an Order Summary record for the following steps. Use commerce store to submit an order.
    1. Navigate to the Order Management application.
    2. Navigate to the Order Summaries list. Choose Order Summaries from the object type drop-down list.
    3. Click on any Order Summary link in the Order summary Number column.
    4. Click the Setup gear and choose Edit Page in the drop-down menu. Close any toast popups that appear on the new Lightning App Builder page.
    5. Click on the Actions & Recommendations pane on the Lightning App Builder page. The right-most pane updates with the Actions & Recommendations settings.
    6. In the right pane, enter “SOM Actions” in the Actions & Recommendations Deployment field and choose the SOM Actions item from the list.
    7. Click Save. A confirmation dialog appears.
    8. Click Activate.
    9. Click Assign As Org Default.
    10. Click Next.
    11. Click Save.
    12. Click the Back arrow (←) in the Lightning App Builder page header (top left) to return to the Order Summary page.
