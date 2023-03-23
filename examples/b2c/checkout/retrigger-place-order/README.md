# Re Trigger Place Order Flow

The implementation provided in this directory contains flow metadata files that you can deploy to any Salesforce B2B or B2B2C Commerce enabled org. Use these files to set up an end-to-end Re-Trigger Place Order flow that will let the Commerce Admin Re-trigger the Place Order Flow once he fixes the issues with Place Order process.

## The advantages of using a ReTrigger Place Order Flow:

1. It will let the Commerce Admin Re-trigger the Reference Apex API when he fixes any errors with the Cart to Order Summary Async Process.

## Deploy

This flow will be automatically deployed when using sfdx to setup a B2B or B2B2C store. You may also manually deploy the flow via following:

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
