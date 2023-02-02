# Guide to create scratch Org and stores

## Pre-requisites

1. A Salesforce Org where you want to create scratch Orgs and stores
2. Enable Dev Hub on the Org
    1. Navigate to Setup (Gear icon located in upper right corner)
    2. Search for or navigate to Dev Hub
    3. Switch Enable Dev Hub to ‘Enabled’

## Setup

1. Install SFDX CLI, see [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/) to learn more about the Salesforce CLI
    ```bash
    npm install --global sfdx-cli
    ```
2. Install commerce plugins
    ```bash
    sfdx plugins:install @salesforce/commerce
    ```
3. Install shane plugins
    ```bash
     sfdx plugins:install shane-sfdx-plugins
    ```
4. Verify sfdx-cli version

    ```bash
    sfdx -v

    # sample output
    sfdx-cli/7.182.1 darwin-arm64 node-v16.17.1
    ```

5. Verify sfdx plugin versions

    ```bash
    sfdx plugins

    # sample output
    @salesforce/commerce 242.0.26
    shane-sfdx-plugins 4.43.0
    ├─ @mshanemc/sfdx-sosl 1.1.0
    └─ @mshanemc/plugin-streaming 1.1.7
    ```

6. Authorize your org with CLI

    ```bash
    sfdx force:auth:web:login -r <<INSTANCE_URL>> -a <<ORG_ALIAS>>

    #####example#####
    # sfdx force:auth:web:login -r https://login.test1.pc-rnd.salesforce.com -a mydevhub

    ###### If you created a connected app ######
    # sfdx force:auth:web:login -r <<INSTANCE_URL>> -i <<CONSUMER_KEY/CLIENT_ID>> -a <<ORG_ALIAS>>
    # sfdx force:auth:web:login -r https://login.test1.pc-rnd.salesforce.com -i XXXXX -a mydevhub
    ```

7. Create a scratch org

    ```bash
    sfdx commerce:scratchorg:create -u <<ORG_USERNAME>> -a <<ORG_ALIAS>> -v <<DEVHUB_USERNAME>> -w 15 --json

    #####example#####
    # sfdx commerce:scratchorg:create -u demo_org_1@1commerce.com -a demo_org_1 -v devhubtest1sdb3@mydevhub.com -w 15 --json
    ```

8. Create B2B Aura store

    ```bash
    sfdx commerce:store:create -t 'B2B Commerce' -n <<STORE_NAME>> -o b2b -b <<BUYER_USER_EMAIL>> -u <<ORG_USERNAME>> -v <<DEVHUB_USERNAME>> --apiversion=<<API_VERSION>>

    #####example#####
    # Note: On completion the command outputs the buyer user name and password
    # sfdx commerce:store:create -t 'B2B Commerce' -n b2bstore01 -o b2b -b b2b_aura_buyer@1commerce.com -u demo_org_1@1commerce.com -v devhubtest1sdb3@mydevhub.com --apiversion=57.0
    ```

9. Create B2B LWR store

    ```bash
    sfdx commerce:store:create -n <<STORE_NAME>> -o b2b -b <<BUYER_USER_EMAIL>> -u <<ORG_USERNAME>> -v <<DEVHUB_USERNAME>> --apiversion=<<API_VERSION>>

    #####example#####
    # sfdx commerce:store:create -n b2bstore02 -o b2b -b b2b_buyer@1commerce.com -u demo_org_1@1commerce.com -v devhubtest1sdb3@mydevhub.com --apiversion=57.0
    ```

10. Create B2C LWR store

    ```bash
    sfdx commerce:store:create -n <<STORE_NAME>> -o b2c -b <<BUYER_USER_EMAIL>> -u <<ORG_USERNAME>> -v <<DEVHUB_USERNAME>> --apiversion=<<API_VERSION>>

    #####example#####
    # sfdx commerce:store:create -n b2cstore01 -o b2c -b b2c_buyer@1commerce.com -u demo_org_1@1commerce.com -v devhubtest1sdb3@mydevhub.com --apiversion=57.0
    ```

## Useful Commands

-   To see all the Orgs run `sfdx force:org:list -all`
-   If the Org session has timed out, then logout and login back

    ```bash
    sfdx force:auth:logout -u <<ORG_USERNAME>>

    sfdx force:auth:web:login -r <<INSTANCE_URL>> -a <<ORG_ALIAS>>
    ```

-   For more commands, see [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.214.0.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
