# Order Management Reference Implementation

Reference Implementation samples for Order Management.

## This repository includes:

1. A flow to approve an order summary record.
2. A flow to fulfill orders for one location, Warehouse.
3. A flow to create invoice once the order is fulfilled.
4. A flow to support cancellation of an item in the order.
5. A flow to support discounting an item in the order.
6. A flow to support returning an item in the order.
7. Actions & Recommendations Deployment for the order summary page. This is named as "SOM Actions".

_Note:_ The Cancel, Discount and Return an Item flows are cloned from the default templates that are available in the Org

## Setup

1. Setup order management flows and actions.
    ```bash
    sfdx commerce:ordermanagement:quickstart:setup -u <<ORG_USERNAME>> --json
    ```
2. Add an Actions & Recommendation Deployment to the Order Summary page. You will need an Order Summary record for the below steps. Use commerce store to submit an order.
    1. Navigate to the Order Management application.
    2. Navigate to the Order Summaries list. Choose Order Summaries from the object type drop down list.
    3. Click on any Order Summary link in the Order summary Number column.
    4. Click the Setup gear and choose Edit Page in the drop down menu. Close any toast popups that may appear on the new Lightning App Builder page.
    5. Click on the Actions & Recommendations pane on the Lightning App Builder page. The right-most pane will update with Actions & Recommendations settings.
    6. In the right pane, enter “SOM Actions” in the Actions & Recommendations Deployment field and choose the SOM Actions item from the list.
    7. Click the Save button. A confirmation dialog will appear.
    8. Click the Activate button.
    9. Click the Assign As Org Default button.
    10. Click the Next button.
    11. Click the Save button.
    12. Click the Back arrow (←) in the Lightning App Builder page header (top left) to return to the Order Summary page.
