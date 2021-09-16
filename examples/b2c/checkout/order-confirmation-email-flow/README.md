# Order Confirmation Email Notification Implementation

The implementation provided in this directory contains metadata, including Order Summary object custom fields, email alert, email template, and flow metadata files that you can deploy to any Salesforce B2B2C Commerce enabled org. Use these files to set up an end-to-end notification strategy so that shoppers receive a confirmation email when checkout is complete.

## Deploy Using Workbench

1.  Create a .zip file of this directory:
    `zip -r -X <your-zip-file>.zip *`
2.  Open Workbench and go to **migration** -> **Deploy**.
3.  Click **Choose File** and navigate to the .zip file you created ( `<your-zip-file>.zip` ).
4.  Select **Single Package**.
5.  Click **Next**.
6.  Click **Deploy**.

## Configure Examples

_Warning_: After you install the examples, you must manually complete the following tasks using valid information to trigger the order confirmation email.

### Update Custom Fields of the Order Summary Object

1.  Go to **Setup** -> **Object Manager**.
2.  Click **Order Summary**.
3.  Click **Fields & Relationships**.
4.  Click each of the following custom fields, click **Set Field-Level Security**, select **Visible** for the **System Administrator** profile, and click **Save**:

-   **OCE_Account_First_Name\_\_c**
-   **OCE_Account_Last_Name\_\_c**
-   **OCE_Order_Items\_\_c**
-   **OCE_Order_Total\_\_c**
-   **OCE_Payment_Method\_\_c**
-   **OCE_Shipping_Address\_\_c**
-   **OCE_Shipping_Method\_\_c**

### Update Store ID in the Flow

1.  Go to **Setup** -> **Flows**.
2.  Click **B2B2C Order Confirmation Email Notification Flow**.
3.  Edit the **IsB2B2CStore** decision element on the flow to change the **Value** to your store ID. To find your store ID, go to **Commerce App** -> **Stores**, click your store name, and note the URL for the page, which contains your store ID. For example, if URL is https://alpine2.lightning.force.com/lightning/r/WebStore/**0ZEB0000000Gx26OAC**/view, store ID is **0ZEB0000000Gx26OAC**.
4.  Click **Save As**, select **A New Version**, and click **Save**.
5.  Click **Activate**.

### Update Email Alert

1.  Go to **Setup** -> **Organization-Wide Addresses**.
2.  Click **Add** for **User Selectable Organization-Wide Email Addresses**.
3.  Enter a **Display Name** and **Email Address**.
4.  Select **Allow All Profiles to Use this From Address** and click **Save**. Status of the address you entered is _Verification Request Sent_.
5.  Check email at the address you entered for an email requesting verification. Click the link in the email to verify the address. Status of the address is now _Verified_.
6.  Go to **Setup** -> **Email Alerts**.
7.  Click **Edit** for the **B2B2C Order Confirmation Email Alert**.
8.  From the **From Email Address** dropdown menu, select the organization-wide email address you entered.
