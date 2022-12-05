# Re Trigger Place Order Flow

The implementation provided in this directory contains flow metadata files that you can deploy to any Salesforce B2B2C Commerce enabled org. Use these files to set up an end-to-end Re-Trigger Place Order flow that will let the Commerce Admin Re-trigger the Place Order Flow once he fixes the issues with Place Order process


##  The advantages of using a ReTrigger Place Order Flow:

1. It will let the Commerce Admin Re-trigger the Reference Apex API when he fixes any errors with the Cart to Order Summary Async Process.


## Deploy
Note: Create through Workbench, no UI setup available

### Deploy Using Workbench

1.  Create a .zip file of this directory:
    `zip -r -X <your-zip-file>.zip *`
2.  Open Workbench and go to **migration** -> **Deploy**.
3.  Click **Choose File** and navigate to the .zip file you created ( `<your-zip-file>.zip` ).
4.  Select **Single Package**.
5.  Click **Next**.
6.  Click **Deploy**.
