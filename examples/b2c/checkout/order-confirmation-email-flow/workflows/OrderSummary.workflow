<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <alerts>
        <fullName>B2B2C_Order_Confirmation_Email_Alert</fullName>
        <description>B2B2C Order Confirmation Email Alert</description>
        <protected>false</protected>
        <recipients>
            <field>BillingEmailAddress</field>
            <type>email</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>unfiled$public/B2B2C_Order_Confirmation_Email</template>
    </alerts>
</Workflow>
