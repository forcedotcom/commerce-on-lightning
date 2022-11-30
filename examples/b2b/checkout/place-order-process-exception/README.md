# Place Order Process Exception Flow

The implementation provided in this directory contains flow metadata files that you can deploy to any Salesforce B2B2C Commerce enabled org. Use these files to set up an end-to-end Place Order Exception Handling flow that handles `PlaceOrderFailed` ExceptionType event and creates exception record with priority `High`


##  The advantages of using a ProcessException Event:

1. It has a category/severity and other attributes for handling errors by the admin
2. ProcessExceptions can be assigned to a case.
    1. The ProcessException has a lifecycle and can be managed
3. There is a slack integration with ProcessExceptions.
    1. https://salesforce.quip.com/szbiObozfkiA
    2. Process Exception Slack UI Review https://docs.google.com/document/d/15Q_VGGR0qfnDful-WzJP74_KR9dZ-JfTMRCaUTDvWUY/edit?usp=sharing
    3. Process Exception Slack Package : https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3u00000QsrnXEAR
    4. See https://salesforce.quip.com/VYJbAWfrsGY3

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
