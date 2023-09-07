# How to Create Scratch Orgs and Stores

## Prerequisites

1. A Salesforce org where you want to create stores and that serves as a Dev Hub for creating scratch orgs.
2. Enable Dev Hub on the org:
    1. Navigate to Setup by clicking the gear icon located in upper right corner.
    2. Enter `Dev Hub` in the Quick Find box and select **Dev Hub**.
    3. Click **Enable Dev Hub** so it says `Enabled`.

## Setup

1. Install Salesforce CLI. You can install the CLI with either npm or with a downloadable installer for your specific operating system. See [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) for more information.
    ```bash
    npm install --global sfdx-cli
    ```
2. Install the Commerce plugins.
    ```bash
    sfdx plugins:install @salesforce/commerce
    ```
3. Install the shane-sfdx-plugins.
    ```bash
     sfdx plugins:install shane-sfdx-plugins
    ```
4. Verify that you installed Salesforce CLI correctly and see what version was installed.

    ```bash
    sfdx -v

    # sample output
    sfdx-cli/7.182.1 darwin-arm64 node-v16.17.1
    ```

5. Verify that you successfully installed the required plugins and see what versions were installed.

    ```bash
    sfdx plugins

    # sample output
    @salesforce/commerce 242.0.26
    shane-sfdx-plugins 4.43.0
    ├─ @mshanemc/sfdx-sosl 1.1.0
    └─ @mshanemc/plugin-streaming 1.1.7
    ```

6. Authorize your org for use with Salesforce CLI.

    ```bash
    sfdx force:auth:web:login -r <<INSTANCE_URL>> -a <<ORG_ALIAS>>

    #####example#####
    # sfdx force:auth:web:login -r https://login.test1.pc-rnd.salesforce.com -a mydevhub

    ###### If you created your own connected app ######
    # sfdx force:auth:web:login -r <<INSTANCE_URL>> -i <<CONSUMER_KEY/CLIENT_ID>> -a <<ORG_ALIAS>>
    # sfdx force:auth:web:login -r https://login.test1.pc-rnd.salesforce.com -i XXXXX -a mydevhub
    ```

7. Create a scratch org.

    **Note:** By default, new scratch orgs contain 1 administrator user with no password. To generate a password, see [Generate or Change a Password for a Scratch Org User](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_passwd.htm).

    ```bash
    sfdx commerce:scratchorg:create -u <<ORG_USERNAME>> -a <<ORG_ALIAS>> -v <<DEVHUB_USERNAME>> -w 15 --json

    #####example#####
    # Note: This command creates an Org with both B2B and B2C features. To create an org with just B2B or B2C features pass the type (-t) argument
    # sfdx commerce:scratchorg:create -u demo_org_1@1commerce.com -a demo_org_1 -v devhubtest1sdb3@mydevhub.com -w 15 --json
    ```

8. Create a B2B Aura store.

    ```bash
    sfdx commerce:store:create -t '<<TEMPLATE_NAME>>' -n <<STORE_NAME>> -o b2b -b <<BUYER_USER_EMAIL>> -u <<ORG_USERNAME>> -v <<DEVHUB_USERNAME>> --apiversion=<<API_VERSION>>

    #####example#####
    # Note: The template name for Aura store is 'B2B Commerce (Aura)'. To see the available templates run force:community:template:list.
    # sfdx commerce:store:create -t 'B2B Commerce (Aura)' -n b2bstore01 -o b2b -b b2b_aura_buyer@1commerce.com -u demo_org_1@1commerce.com -v devhubtest1sdb3@mydevhub.com --apiversion=57.0
    ```

9. Create a B2B LWR store.

    ```bash
    sfdx commerce:store:create -n <<STORE_NAME>> -o b2b -b <<BUYER_USER_EMAIL>> -u <<ORG_USERNAME>> -v <<DEVHUB_USERNAME>> --apiversion=<<API_VERSION>>

    #####example#####
    # sfdx commerce:store:create -n b2bstore02 -o b2b -b b2b_buyer@1commerce.com -u demo_org_1@1commerce.com -v devhubtest1sdb3@mydevhub.com --apiversion=57.0
    ```

10. Create a B2C LWR store.

    ```bash
    sfdx commerce:store:create -n <<STORE_NAME>> -o b2c -b <<BUYER_USER_EMAIL>> -u <<ORG_USERNAME>> -v <<DEVHUB_USERNAME>> --apiversion=<<API_VERSION>>

    #####example#####
    # sfdx commerce:store:create -n b2cstore01 -o b2c -b b2c_buyer@1commerce.com -u demo_org_1@1commerce.com -v devhubtest1sdb3@mydevhub.com --apiversion=57.0
    ```

## Useful Commands

-   To see all the orgs that you previously authorized, run `sfdx force:org:list -all`.
-   To see all the available templates run `sfdx force:community:template:list -u <<ORG_USERNAME>>`
-   If the org session times out, then logout and log back in again.

    ```bash
    sfdx force:auth:logout -u <<ORG_USERNAME>>

    sfdx force:auth:web:login -r <<INSTANCE_URL>> -a <<ORG_ALIAS>>
    ```

-   To see the information of an org, run `sfdx force:org:display -u "<<ORG_USERNAME>>"`.
-   For more commands, see the [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm).
