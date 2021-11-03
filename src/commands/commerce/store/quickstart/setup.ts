/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { existsSync } from 'fs';
import * as path from 'path';
import { SfdxCommand } from '@salesforce/command';
import { fs, Messages, SfdxError, Org as SfdxOrg } from '@salesforce/core';
import chalk from 'chalk';
import { AnyJson } from '@salesforce/ts-types';
import { allFlags } from '../../../../lib/flags/commerce/all.flags';
import { addAllowedArgs, filterFlags } from '../../../../lib/utils/args/flagsUtils';
import {
    BASE_DIR,
    BUYER_USER_DEF,
    EXAMPLE_DIR,
    PACKAGE_RETRIEVE,
    PACKAGE_RETRIEVE_TEMPLATE,
    QUICKSTART_CONFIG,
    SCRATCH_ORG_DIR,
    STORE_DIR,
} from '../../../../lib/utils/constants/properties';
import { copyFolderRecursiveSync, mkdirSync, remove, XML } from '../../../../lib/utils/fsUtils';
import { BuyerUserDef, Org, parseStoreScratchDef, StoreConfig } from '../../../../lib/utils/jsonUtils';
import { Requires } from '../../../../lib/utils/requires';
import { forceDataRecordCreate, forceDataRecordUpdate, forceDataSoql } from '../../../../lib/utils/sfdx/forceDataSoql';
import { getHubOrgByUsername, getScratchOrgByUsername } from '../../../../lib/utils/sfdx/forceOrgList';
import { shell, shellJsonSfdx } from '../../../../lib/utils/shell';
import { StatusFileManager } from '../../../../lib/utils/statusFileManager';
import { ProductsImport } from '../../products/import';
import { StoreCreate } from '../create';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'store';
const CMD = `commerce:${TOPIC}:quickstart:setup`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class StoreQuickstartSetup extends SfdxCommand {
    // TODO add apiversion to all shell'd commands
    public static readonly requiresUsername = true;
    public static readonly requiresDevhubUsername = true;
    public static description = msgs.getMessage('quickstart.setup.cmdDescription');
    public static varargs = {
        required: false,
        validator: (name: string): void => {
            // Whitelist varargs parameter names
            if (!StoreCreate.vargsAllowList.includes(name)) {
                const errMsg = `Invalid parameter [${name}] found`;
                const errName = 'InvalidVarargName';
                const errAction = `Choose one of these parameter names: ${StoreCreate.vargsAllowList.join()}`;
                throw new SfdxError(errMsg, errName, [errAction]);
            }
        },
    };
    public static get vargsAllowList(): string[] {
        return [
            'communityNetworkName',
            'communitySiteName',
            'communityExperienceBundleName',
            'isSharingRuleMetadataNeeded',
        ];
    }

    public static examples = [`sfdx ${CMD} --definitionfile store-scratch-def.json`];

    protected static flagsConfig = {
        ...filterFlags(['store-name', 'definitionfile'], allFlags),
    };

    private static storeType: string;
    public org: SfdxOrg;
    public statusFileManager: StatusFileManager;
    private devHubUsername: string;
    private storeDir: string;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static getStoreType(username: string, storeName: string, ux): string {
        if (!ux) ux = console;
        if (this.storeType) return this.storeType;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        ux.log(msgs.getMessage('quickstart.setup.checkingB2BorB2C'));
        const storeTypeRes = forceDataSoql(`SELECT Type FROM WebStore WHERE Name = '${storeName}'`, username);
        if (
            !storeTypeRes.result ||
            !storeTypeRes.result.records ||
            storeTypeRes.result.records.length === 0 ||
            !storeTypeRes.result.records[0]['Type']
        )
            throw new SfdxError(msgs.getMessage('quickstart.setup.storeTypeDoesNotExist'));
        const storeType = storeTypeRes.result.records[0]['Type'] as string;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        ux.log('Store Type = ' + JSON.stringify(storeType));
        // Update Guest Profile with required CRUD and FLS
        this.storeType = storeType;
        return storeType;
    }

    public async run(): Promise<AnyJson> {
        this.devHubUsername = (await this.org.getDevHubOrg()).getUsername();
        this.statusFileManager = new StatusFileManager(
            this.devHubUsername,
            this.org.getUsername(),
            this.flags['store-name'] as string
        );
        // TODO this is only in store create so makes sense to key off of store
        await new Requires()
            .examplesConverted(
                SCRATCH_ORG_DIR(BASE_DIR, this.devHubUsername, this.org.getUsername()),
                this.flags['store-name'],
                this.flags.definitionfile
            )
            .build();
        this.storeDir = STORE_DIR(BASE_DIR, this.devHubUsername, this.org.getUsername(), this.flags['store-name']);
        if (!getScratchOrgByUsername(this.org.getUsername()))
            if (getHubOrgByUsername(this.devHubUsername).connectedStatus.indexOf('expired') >= 0)
                // todo make this a check earlier
                throw new SfdxError(this.devHubUsername + ' is expired or invalid');
            else throw new SfdxError(msgs.getMessage('quickstart.setup.orgCreationNotCompletedSuccesfully'));
        // TODO might add these (communityNetworkName) to varargs
        this.varargs['communityNetworkName'] ??= this.flags['store-name'] as string;
        // If the name of the store starts with a digit, the CustomSite name will have a prepended X.
        this.varargs['communitySiteName'] ??=
            (/^[0-9]+/.exec(this.flags['store-name']) ? 'X' : '') + (this.flags['store-name'] as string);
        // The ExperienceBundle name is similar to the CustomSite name, but has a 1 appended.
        this.varargs['communityExperienceBundleName'] ??= `${this.varargs['communitySiteName'] as string}1`;
        await this.retrievePackages();
        this.ux.log(chalk.green.bold(msgs.getMessage('quickstart.setup.completedQuickstartStep1')));
        await this.setupIntegrations();
        this.ux.log(chalk.green.bold(msgs.getMessage('quickstart.setup.completedQuickstartStep2')));
        if (StoreQuickstartSetup.getStoreType(this.org.getUsername(), this.flags['store-name'], this.ux) === 'B2B') {
            // replace sfdc_checkout__CheckoutTemplate with $(ls force-app/main/default/flows/*Checkout.flow-meta.xml | sed 's/.*flows\/\(.*\).flow-meta.xml/\1/')
            await this.updateFlowAssociatedToCheckout();
        }
        await this.updateMemberListActivateCommunity();
        this.ux.log(chalk.green.bold(msgs.getMessage('quickstart.setup.completedQuickstartStep3')));
        await this.importProducts();
        await this.mapAdminUserToRole();
        this.ux.log(chalk.green.bold(msgs.getMessage('quickstart.setup.completedQuickstartStep4')));
        await this.createBuyerUserWithContactAndAccount();
        await this.addContactPointAndDeploy();
        await this.publishCommunity();
        this.ux.log(chalk.green.bold(msgs.getMessage('quickstart.setup.completedQuickstartSetup')));
        return { quickstartSetup: true };
    }

    private async retrievePackages(): Promise<void> {
        // TODO possible turn this into a requires
        if (await this.statusFileManager.getValue('retrievedPackages')) return;
        // Replace the names of the components that will be retrieved. // this should stay as a template so users can modify it to their liking
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        let packageRetrieve = fs
            .readFileSync(
                PACKAGE_RETRIEVE_TEMPLATE(
                    StoreQuickstartSetup.getStoreType(
                        this.org.getUsername(),
                        this.flags['store-name'],
                        this.ux
                    ).toLowerCase()
                )
            )
            .toString()
            .replace('YourCommunitySiteNameHere', this.varargs['communitySiteName'] as string)
            .replace('YourCommunityExperienceBundleNameHere', this.varargs['communityExperienceBundleName'] as string)
            .replace('YourCommunityNetworkNameHere', this.varargs['communityNetworkName'] as string);
        // turn sharing rule metadata off by default
        if (!(this.varargs['isSharingRuleMetadataNeeded'] && this.varargs['isSharingRuleMetadataNeeded'] === 'true')) {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
            const res = XML.parse(packageRetrieve);
            res['Package']['types'] = res['Package']['types'].filter((t) => t['members'] !== 'ProductCatalog');
            /* eslint-disable */
            packageRetrieve = XML.stringify(res);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        fs.writeFileSync(PACKAGE_RETRIEVE(this.storeDir), packageRetrieve);
        this.ux.log(msgs.getMessage('quickstart.setup.usingToRetrieveStoreInfo', [packageRetrieve]));
        this.ux.log(msgs.getMessage('quickstart.setup.getStoreMetadatFromZip'));
        shell(
            `sfdx force:mdapi:retrieve -u "${this.org.getUsername()}" -r "${
                this.storeDir
            }/experience-bundle-package" -k "${PACKAGE_RETRIEVE(this.storeDir)}"`
        );
        shell(
            `unzip -o -d "${this.storeDir}/experience-bundle-package" "${this.storeDir}/experience-bundle-package/unpackaged.zip"`
        );
        await StoreCreate.waitForStoreId(this.statusFileManager, this.ux);
        await this.statusFileManager.setValue('retrievedPackages', true);
    }

    private async setupIntegrations(): Promise<void> {
        if (await this.statusFileManager.getValue('integrationSetup')) return;
        this.ux.log(msgs.getMessage('quickstart.setup.setUpIntegrations'));
        await StoreCreate.waitForStoreId(this.statusFileManager, this.ux);
        this.ux.log(msgs.getMessage('quickstart.setup.regAndMapIntegrations'));
        const integrations = [
            ['B2BCheckInventorySample', 'CHECK_INVENTORY', 'Inventory'],
            ['B2BDeliverySample', 'COMPUTE_SHIPPING', 'Shipment'],
            ['B2BTaxSample', 'COMPUTE_TAXES', 'Tax'],
        ];
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        integrations.forEach((args) => this.registerAndMapIntegration(...args));
        this.ux.log(msgs.getMessage('quickstart.setup.doneRegAndMapIntegrations'));

        // By default, use the internal pricing integration
        this.ux.log(msgs.getMessage('quickstart.setup.regAndMapPriceIntegrations'));
        await this.registerAndMapPricingIntegration();
        this.ux.log(msgs.getMessage('quickstart.setup.doneRegAndMapPriceIntegrations'));
        // To use an external integration instead, use the code below:
        // register_and_map_integration "B2BPricingSample" "COMPUTE_PRICE" "Price"
        // Or follow the documentation for setting up the integration manually:
        // https://developer.salesforce.com/docs/atlas.en-us.b2b_comm_lex_dev.meta/b2b_comm_lex_dev/b2b_comm_lex_integration_setup.htm

        this.registerAndMapCreditCardPaymentIntegration();
        this.ux.log(
            msgs.getMessage('quickstart.setup.urlForResOfMappingIntegrations', [
                '/lightning/page/storeDetail?lightning__webStoreId=',
                await this.statusFileManager.getValue('id'),
                '&storeDetail__selectedTab=store_integrations',
            ])
        );
        await this.statusFileManager.setValue('integrationSetup', true);
    }

    private async registerAndMapIntegration(
        apexClassName?: string,
        developerName?: string,
        serviceProviderType?: string
    ): Promise<void> {
        this.ux.log(
            msgs.getMessage('quickstart.setup.regApexClassForIntegrations', [
                apexClassName,
                developerName,
                serviceProviderType,
            ])
        );
        let apexClassId: string;
        try {
            apexClassId = forceDataSoql(
                `SELECT Id FROM ApexClass WHERE Name='${apexClassName}' LIMIT 1`,
                this.org.getUsername()
            ).result.records[0].Id;
        } catch (e) {
            this.ux.log(
                chalk.red(
                    msgs.getMessage('quickstart.setup.errorRegApexClassForIntegrationsInfo', [
                        apexClassName,
                        'run sfdx commerce:examples:convert',
                        'sfdx force:source:push -f',
                    ])
                )
            );
            return;
        }
        forceDataRecordCreate(
            'RegisteredExternalService',
            `DeveloperName=${developerName} ExternalServiceProviderId=${apexClassId} ExternalServiceProviderType=${serviceProviderType} MasterLabel=${developerName}`,
            this.org.getUsername()
        );
        const storeIntegratedServiceId = forceDataSoql(
            `SELECT Id FROM StoreIntegratedService WHERE ServiceProviderType='${serviceProviderType}' AND StoreId='${await this.statusFileManager.getValue(
                'id'
            )}' LIMIT 1`,
            this.org.getUsername()
        );
        if (storeIntegratedServiceId.result.totalSize !== 0) {
            this.ux.log(
                msgs.getMessage('quickstart.setup.alreadyMappingInStoreForServiceProviderType', [
                    serviceProviderType,
                    storeIntegratedServiceId.result.records[0].Id,
                ])
            );
            return;
        }
        // No mapping exists, so we will create one
        const registeredExternalServiceId = forceDataSoql(
            `SELECT Id FROM RegisteredExternalService WHERE ExternalServiceProviderId='${apexClassId}' LIMIT 1`,
            this.org.getUsername()
        ).result.records[0].Id;
        forceDataRecordCreate(
            'StoreIntegratedService',
            `Integration=${registeredExternalServiceId} StoreId=${await this.statusFileManager.getValue(
                'id'
            )} ServiceProviderType=${serviceProviderType}`,
            this.org.getUsername()
        );
    }

    private async registerAndMapPricingIntegration(): Promise<void> {
        const serviceProviderType = 'Price';
        const integrationName = 'Price__B2B_STOREFRONT__StandardPricing';
        this.ux.log(
            msgs.getMessage('quickstart.setup.registeringInternalPricingForServiceProviderType', [
                integrationName,
                serviceProviderType,
            ])
        );
        const pricingIntegrationId = forceDataSoql(
            `SELECT Id FROM StoreIntegratedService WHERE ServiceProviderType='${serviceProviderType}' AND StoreId='${await this.statusFileManager.getValue(
                'id'
            )}' LIMIT 1`,
            this.org.getUsername()
        ).result;
        if (pricingIntegrationId.totalSize > 0) {
            this.ux.log(
                msgs.getMessage('quickstart.setup.existingMappingForPriceServiceProviderType', [
                    pricingIntegrationId.records[0].Id,
                ])
            );
            return;
        }
        forceDataRecordCreate(
            'StoreIntegratedService',
            `Integration=${integrationName} StoreId=${await this.statusFileManager.getValue(
                'id'
            )} ServiceProviderType=${serviceProviderType}`,
            this.org.getUsername()
        );
        this.ux.log(msgs.getMessage('quickstart.setup.insToRegExternalPricingIntegration'));
    }

    private registerAndMapCreditCardPaymentIntegration(): void {
        this.ux.log(msgs.getMessage('quickstart.setup.registeringCreditCardPaymentIntegration'));
        // Creating Payment Gateway Provider
        const apexClassId = forceDataSoql(
            "SELECT Id FROM ApexClass WHERE Name='SalesforceAdapter' LIMIT 1",
            this.org.getUsername()
        ).result.records[0].Id;
        this.ux.log(
            msgs.getMessage('quickstart.setup.creatingPaymentGatewayProviderRecordUsingApexAdapterId', [apexClassId])
        );
        forceDataRecordCreate(
            'PaymentGatewayProvider',
            `DeveloperName=SalesforcePGP ApexAdapterId=${apexClassId} MasterLabel=SalesforcePGP IdempotencySupported=Yes Comments=Comments`,
            this.org.getUsername()
        );
        // Creating Payment Gateway
        const paymentGatewayProviderId = forceDataSoql(
            "SELECT Id FROM PaymentGatewayProvider WHERE DeveloperName='SalesforcePGP' LIMIT 1",
            this.org.getUsername()
        ).result.records[0].Id;
        const namedCredentialId = forceDataSoql(
            "SELECT Id FROM NamedCredential WHERE MasterLabel='Salesforce' LIMIT 1",
            this.org.getUsername()
        ).result.records[0].Id;
        this.ux.log(
            msgs.getMessage(
                'quickstart.setup.creatingPaymentGatewayRecordMerchantCredentialIdPaymentGatewayProviderId',
                [namedCredentialId, paymentGatewayProviderId]
            )
        );
        forceDataRecordCreate(
            'PaymentGateway',
            `MerchantCredentialId=${namedCredentialId} PaymentGatewayName=SalesforcePG PaymentGatewayProviderId=${paymentGatewayProviderId} Status=Active`,
            this.org.getUsername()
        );
        // Creating Store Integrated Service
        const storeId = forceDataSoql(
            `SELECT Id FROM WebStore WHERE Name='${this.varargs['communityNetworkName'] as string}' LIMIT 1`,
            this.org.getUsername()
        ).result.records[0].Id;
        const paymentGatewayId = forceDataSoql(
            "SELECT Id FROM PaymentGateway WHERE PaymentGatewayName='SalesforcePG' LIMIT 1",
            this.org.getUsername()
        ).result.records[0].Id;
        this.ux.log(
            msgs.getMessage('quickstart.setup.creatingStoreIntegratedServiceWithStorePaymentGatewayId', [
                this.varargs['communityNetworkName'] as string,
                paymentGatewayId,
            ])
        );
        forceDataRecordCreate(
            'StoreIntegratedService',
            `Integration=${paymentGatewayId} StoreId=${storeId} ServiceProviderType=Payment`,
            this.org.getUsername()
        );
    }

    private async updateMemberListActivateCommunity(): Promise<void> {
        if (await this.statusFileManager.getValue('memberListUpdatedCommunityActive')) return;
        if (!fs.existsSync(`${this.storeDir}/experience-bundle-package/unpackaged`)) {
            await this.statusFileManager.setValue('retrievedPackages', false);
            await this.retrievePackages();
        }
        this.ux.log(msgs.getMessage('quickstart.setup.updatingMembersListActivatingCommunityAndAddingGuestUser'));
        const networkMetaFile = `${this.storeDir}/experience-bundle-package/unpackaged/networks/${
            this.varargs['communityNetworkName'] as string
        }.network`;
        const data = fs
            .readFileSync(networkMetaFile)
            .toString()
            .replace(
                /<networkMemberGroups>([\s|\S]*?)<\/networkMemberGroups>/,
                `<networkMemberGroups>\n        <profile>Buyer_User_Profile_From_QuickStart${
                    StoreQuickstartSetup.getStoreType(
                        this.org.getUsername(),
                        this.flags['store-name'],
                        this.ux
                    ).toLowerCase() === 'b2b'
                        ? '_B2B'
                        : ''
                }</profile>\n        <profile>admin</profile>\n    </networkMemberGroups>`
            )
            .replace(/<status>.*/, '<status>Live</status>');
        if (StoreQuickstartSetup.getStoreType(this.org.getUsername(), this.flags['store-name'], this.ux) === 'B2C')
            data.replace(/<enableGuestChatter>.*/, '<enableGuestChatter>true</enableGuestChatter>')
                .replace(/<enableGuestFileAccess>.*/, '<enableGuestFileAccess>true</enableGuestFileAccess>')
                .replace(/<selfRegistration>.*/, '<selfRegistration>true</selfRegistration>');
        // .replace('</Network>', '    <selfRegProfile>Buyer_User_Profile_From_QuickStart</selfRegProfile>\n</Network>'); // "Error: You can only select profiles that are associated with the experience."
        fs.writeFileSync(networkMetaFile, data);
        await this.statusFileManager.setValue('memberListUpdatedCommunityActive', true);
    }

    private updateSelfRegProfile(): void {
        const networkMetaFile = `${this.storeDir}/experience-bundle-package/unpackaged/networks/${
            this.varargs['communityNetworkName'] as string
        }.network`;
        let data = fs
            .readFileSync(networkMetaFile)
            .toString()
            .replace(/<selfRegProfile>.*<\/selfRegProfile>/g, '')
            .replace(
                '</Network>',
                `    <selfRegProfile>Buyer_User_Profile_From_QuickStart${
                    StoreQuickstartSetup.getStoreType(
                        this.org.getUsername(),
                        this.flags['store-name'],
                        this.ux
                    ).toLowerCase() === 'b2b'
                        ? '_B2B'
                        : ''
                }</selfRegProfile>\n</Network>`
            );
        const r = {
            disableReputationRecordConversations: false,
            enableDirectMessages: false,
            enableGuestChatter: true,
            enableTalkingAboutStats: false,
            selfRegistration: true,
        };
        Object.keys(r).forEach(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            (v) => (data = data.replace(new RegExp(`<${v}>.*</${v}>`, 'g'), `<${v}>${r[v]}</${v}>`))
        );
        fs.writeFileSync(networkMetaFile, data);
        shell(
            `cd "${this.storeDir}/experience-bundle-package/unpackaged" && zip -r -X "../${
                this.varargs['communityExperienceBundleName'] as string
            }ToDeploy.zip" ./*`
        );
        shellJsonSfdx(
            `sfdx force:mdapi:deploy -u "${this.org.getUsername()}" -g -f "${this.storeDir}/experience-bundle-package/${
                this.varargs['communityExperienceBundleName'] as string
            }ToDeploy.zip" --wait -1 --verbose --singlepackage`
        );
    }

    private async importProducts(): Promise<void> {
        if (
            (await this.statusFileManager.getValue('productsImported')) === true &&
            (await this.statusFileManager.getValue('buyerGroupName'))
        )
            return;
        const buyerGroupName = (await ProductsImport.run(
            addAllowedArgs(this.argv, ProductsImport),
            this.config
        )) as Record<string, string>;
        if (!buyerGroupName)
            throw new SfdxError(msgs.getMessage('quickstart.setup.errorNoBuyerGroupNameProductImportFailed'));
        await this.statusFileManager.setValue('productsImported', true);
        await this.statusFileManager.setValue('buyerGroupName', buyerGroupName['buyerGroupName']);
    }

    private async mapAdminUserToRole(): Promise<void> {
        // TODO find something to verify this is done better than a step
        if (await this.statusFileManager.getValue('adminUserMapped')) return;
        this.ux.log(msgs.getMessage('quickstart.setup.mappingAdminUserToRole'));
        const ceoID = forceDataSoql("SELECT Id FROM UserRole WHERE Name = 'CEO'", this.org.getUsername()).result
            .records[0].Id;
        try {
            forceDataRecordCreate(
                'UserRole',
                `ParentRoleId='${ceoID}' Name='AdminRoleFromQuickstart' DeveloperName='AdminRoleFromQuickstart' RollupDescription='AdminRoleFromQuickstart' `,
                this.org.getUsername()
            );
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (e.message.indexOf('DUPLICATE_DEVELOPER_NAME') < 0) throw e;
            this.ux.log(msgs.getMessage('quickstart.setup.thisDeveloperNameAlreadyExists'));
        }
        const newRoleID = forceDataSoql(
            "SELECT Id FROM UserRole WHERE Name = 'AdminRoleFromQuickstart'",
            this.org.getUsername()
        ).result.records[0].Id;
        const username = shellJsonSfdx<Org>(
            `sfdx force:user:display -u "${this.org.getUsername()}" -v "${(
                await this.org.getDevHubOrg()
            ).getUsername()}" --json`
        ).result.username;
        forceDataRecordUpdate('User', `UserRoleId='${newRoleID}'`, `Username='${username}'`, this.org.getUsername());
        await this.statusFileManager.setValue('adminUserMapped', true);
    }

    private async createBuyerUserWithContactAndAccount(): Promise<void> {
        while (
            !(
                (await this.statusFileManager.getValue('productsImported')) === true &&
                (await this.statusFileManager.getValue('buyerGroupName'))
            )
        )
            await this.importProducts();
        if (
            (await this.statusFileManager.getValue('accountId')) &&
            (await this.statusFileManager.getValue('buyerUsername'))
        )
            return;
        this.ux.log(msgs.getMessage('quickstart.setup.creatingBuyerUserWithContactAndAccount'));
        try {
            shellJsonSfdx(
                `sfdx force:user:create -u "${this.org.getUsername()}" -f "${BUYER_USER_DEF(this.storeDir)}" -v "${(
                    await this.org.getDevHubOrg()
                ).getUsername()}"`
            );
        } catch (err) {
            /* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
            if (
                err.message.indexOf('DUPLICATES_DETECTED') < 0 &&
                err.message.indexOf('duplicateUsername') < 0 &&
                err.message.indexOf('overwrite existing') < 0
            )
                throw err;
            /* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
            this.ux.log('DUPLICATES_DETECTED in force:user:create');
            // if(err) "portal account owner must have a role"  then this.mapAdminUserToRole()
        }
        const buyerUsername = Object.assign(new BuyerUserDef(), await fs.readJson(`${BUYER_USER_DEF(this.storeDir)}`))
            .username;
        this.ux.log(msgs.getMessage('quickstart.setup.makingAccountBuyerAccount'));
        const accountID = forceDataSoql(
            `SELECT Id FROM Account WHERE Name LIKE '${buyerUsername}JITUserAccount' ORDER BY CreatedDate Desc LIMIT 1`,
            this.org.getUsername()
        ).result.records[0].Id;
        forceDataRecordCreate(
            'BuyerAccount',
            `BuyerId='${accountID}' Name='BuyerAccountFromQuickstart' isActive=true`,
            this.org.getUsername()
        );
        this.ux.log(msgs.getMessage('quickstart.setup.assigningBuyerAccountToBuyerGroup'));
        const buyergroupID = forceDataSoql(
            `SELECT Id FROM BuyerGroup WHERE Name='${await this.statusFileManager.getValue('buyerGroupName')}'`,
            this.org.getUsername()
        ).result.records[0].Id;
        try {
            forceDataRecordCreate(
                'BuyerGroupMember',
                `BuyerGroupId='${buyergroupID}' BuyerId='${accountID}'`,
                this.org.getUsername()
            );
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (e.message.indexOf(msgs.getMessage('quickstart.setup.alreadyBeenAdded')) < 0) throw e;
        }
        await this.statusFileManager.setValue('accountId', accountID);
        await this.statusFileManager.setValue('buyerUsername', buyerUsername);
    }

    private async enableGuestBrowsing(): Promise<void> {
        this.ux.log(msgs.getMessage('quickstart.setup.startingGuestBuyerAccessSetup'));
        const scratchOrgDir = SCRATCH_ORG_DIR(
            BASE_DIR,
            (await this.org.getDevHubOrg()).getUsername(),
            this.org.getUsername()
        );

        const communityNetworkName = this.varargs['communityNetworkName'] as string;
        // To get the name of the config file, take community name and ensure first letter is lowercase and no non alphanumeric characters.
        const configName = (communityNetworkName.charAt(0).toLowerCase() + communityNetworkName.slice(1)).replace(
            /[\W_]+/g,
            ''
        );
        const tmpDirName = this.storeDir + '/sourceGuestProfile';
        // Can only force:source:deploy from sfdx project folder
        // Cannot push source Guest Profile earlier as Store is not created yet
        // TODO hardcoded b2c add this to store config file
        let pathToGuestProfile = EXAMPLE_DIR + '/b2c/users/guest-user-profile-setup';
        copyFolderRecursiveSync(pathToGuestProfile, this.storeDir);
        pathToGuestProfile = this.storeDir + '/guest-user-profile-setup';
        // Guest Profile has a space in the name. Do not be alarmed.
        const srcGuestProfile = `${pathToGuestProfile}/profiles/InsertStoreNameHere Profile.profile`;
        const trgtGuestProfile = `${pathToGuestProfile}/profiles/${communityNetworkName} Profile.profile`;
        fs.renameSync(srcGuestProfile, trgtGuestProfile);
        shell(`cd "${scratchOrgDir}" && sfdx force:mdapi:convert -r "${pathToGuestProfile}" -d "${tmpDirName}"`);
        shell(`cd "${scratchOrgDir}" && sfdx force:source:deploy -p "${tmpDirName}" -u "${this.org.getUsername()}"`);

        // Sharing Rules
        if (!(this.varargs['isSharingRuleMetadataNeeded'] && this.varargs['isSharingRuleMetadataNeeded'] === 'true')) {
            const sharingRulesDirOrg = QUICKSTART_CONFIG() + '/guestbrowsing/sharingRules';
            const sharingRulesDir = this.storeDir + '/experience-bundle-package/unpackaged/sharingRules';
            mkdirSync(sharingRulesDir);
            ['ProductCatalog-template.sharingRules', 'Product2-template.sharingRules'].forEach((r) =>
                fs.writeFileSync(
                    sharingRulesDir + '/' + r.replace('-template', ''),
                    fs
                        .readFileSync(sharingRulesDirOrg + '/' + r)
                        .toString()
                        .replace(/YourStoreName/g, this.varargs['communitySiteName'] as string)
                )
            );
        }
        if (!fs.existsSync(`${this.storeDir}/experience-bundle-package/unpackaged/experiences`)) {
            await this.statusFileManager.setValue('retrievedPackages', false);
            await this.retrievePackages();
        }
        this.ux.log(msgs.getMessage('quickstart.setup.makeSiteAndNavMenuItemPublic'));
        const siteConfigMetaFileName =
            this.storeDir +
            `/experience-bundle-package/unpackaged/experiences/${
                this.varargs['communityExperienceBundleName'] as string
            }/config/${configName}.json`;
        const siteConfigMetaFile = Object.assign(new StoreConfig(), await fs.readJson(siteConfigMetaFileName));
        siteConfigMetaFile.isAvailableToGuests = true;
        siteConfigMetaFile.authenticationType = 'AUTHENTICATED_WITH_PUBLIC_ACCESS_ENABLED';
        fs.writeFileSync(siteConfigMetaFileName, JSON.stringify(siteConfigMetaFile, null, 4));
        const def = parseStoreScratchDef(this.flags.definitionfile);
        const relaxedLevel = def.settings.isRelaxedCSPLevel;
        const siteConfigMainAppPageFileName =
            this.storeDir +
            `/experience-bundle-package/unpackaged/experiences/${
                this.varargs['communityExperienceBundleName'] as string
            }/config/mainAppPage.json`;
        if (relaxedLevel) {
            fs.writeFileSync(
                siteConfigMainAppPageFileName,
                fs
                    .readFileSync(siteConfigMainAppPageFileName)
                    .toString()
                    .replace('"isRelaxedCSPLevel" : false,', '"isRelaxedCSPLevel" : true,')
            );
        }
        const navMenuItemMetaFile =
            this.storeDir + '/experience-bundle-package/unpackaged/navigationMenus/Default_Navigation.navigationMenu';
        fs.writeFileSync(
            navMenuItemMetaFile,
            fs
                .readFileSync(navMenuItemMetaFile)
                .toString()
                .replace('<publiclyAvailable>false', '<publiclyAvailable>true')
        );

        this.ux.log(msgs.getMessage('quickstart.setup.enableGuestBrowsingForWebStoreAndCreateGuestBuyerProfile'));
        // Assign to Buyer Group of choice.
        forceDataRecordUpdate(
            'WebStore',
            "OptionsGuestBrowsingEnabled='true'",
            `Name='${communityNetworkName}'`,
            this.org.getUsername()
        );
        let guestBuyerProfileId: string;
        try {
            guestBuyerProfileId = forceDataSoql(
                `SELECT GuestBuyerProfileId FROM WebStore WHERE Name = '${communityNetworkName}'`,
                this.org.getUsername()
            ).result.records[0]['GuestBuyerProfileId'] as string;
        } catch (e) {
            this.ux.log(
                chalk.red(
                    msgs.getMessage(
                        'quickstart.setup.errorGettingGuestBuyerProfileIdOfWebStoreForEnableGuestBrowsing',
                        [communityNetworkName]
                    )
                )
            );
            throw e;
        }
        const buyergroupID = forceDataSoql(
            `SELECT Id FROM BuyerGroup WHERE Name='${await this.statusFileManager.getValue('buyerGroupName')}'`,
            this.org.getUsername()
        ).result.records[0].Id;
        try {
            forceDataRecordCreate(
                'BuyerGroupMember',
                `BuyerGroupId='${buyergroupID}' BuyerId='${guestBuyerProfileId}'`,
                this.org.getUsername()
            );
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (e.message.indexOf(msgs.getMessage('quickstart.setup.alreadyBeenAdded')) < 0) throw e;
        }
        this.ux.log(msgs.getMessage('quickstart.setup.doneGuestBuyerAccessSetup'));
    }

    private async addContactPointAndDeploy(cnt = 0): Promise<void> {
        let accountId = (await this.statusFileManager.getValue('accountId')) as string;
        if (!accountId) await this.createBuyerUserWithContactAndAccount();
        accountId = (await this.statusFileManager.getValue('accountId')) as string;
        // Add Contact Point Addresses to the buyer account associated with the buyer user.
        // The account will have 2 Shipping and 2 billing addresses associated to it.
        // To view the addresses in the UI you need to add Contact Point Addresses to the related lists for Account
        this.ux.log(msgs.getMessage('quickstart.setup.addContactPointAddressesToBuyerAccount'));
        const existingCPAForBuyerAccount = forceDataSoql(
            `SELECT Id FROM ContactPointAddress WHERE ParentId='${accountId}' LIMIT 1`,
            this.org.getUsername()
        ).result;
        if (existingCPAForBuyerAccount.totalSize === 0)
            [
                "AddressType='Shipping' ParentId='$accountID' ActiveFromDate='2020-01-01' ActiveToDate='2040-01-01' City='San Francisco' Country='US' IsDefault='true' Name='Default Shipping' PostalCode='94105' State='CA' Street='415 Mission Street (Shipping)'",
                "AddressType='Billing' ParentId='$accountID' ActiveFromDate='2020-01-01' ActiveToDate='2040-01-01' City='San Francisco' Country='US' IsDefault='true' Name='Default Billing' PostalCode='94105' State='CA' Street='415 Mission Street (Billing)'",
                "AddressType='Shipping' ParentId='$accountID' ActiveFromDate='2020-01-01' ActiveToDate='2040-01-01' City='Burlington' Country='US' IsDefault='false' Name='Non-Default Shipping' PostalCode='01803' State='MA' Street='5 Wall St (Shipping)'",
                "AddressType='Billing' ParentId='$accountID' ActiveFromDate='2020-01-01' ActiveToDate='2040-01-01' City='Burlington' Country='US' IsDefault='false' Name='Non-Default Billing' PostalCode='01803' State='MA' Street='5 Wall St (Billing)'",
            ].forEach((v) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                forceDataRecordCreate('ContactPointAddress', v.replace('$accountID', accountId), this.org.getUsername())
            );
        else
            this.ux.log(
                msgs.getMessage('quickstart.setup.already1OrMoreContactPointAddressForBuyerAccount', [
                    await this.statusFileManager.getValue('buyerUsername'),
                ])
            );

        if (StoreQuickstartSetup.getStoreType(this.org.getUsername(), this.flags['store-name'], this.ux) === 'B2C') {
            this.ux.log(msgs.getMessage('quickstart.setup.settingUpGuestBrowsing'));
            await this.enableGuestBrowsing();
        } else if (
            StoreQuickstartSetup.getStoreType(this.org.getUsername(), this.flags['store-name'], this.ux) === 'B2B'
        ) {
            this.ux.log('Setting up Commerce Diagnostic Event Process Builder');
            const storeId = await StoreCreate.getStoreId(
                new StatusFileManager(
                    (await this.org.getDevHubOrg()).getUsername(),
                    this.org.getUsername(),
                    this.flags['store-name'] as string
                ),
                this.ux
            );
            const processMetaFile =
                this.storeDir + '/experience-bundle-package/unpackaged/flows/Process_CommerceDiagnosticEvents.flow';
            if (!fs.fileExistsSync(processMetaFile) && cnt === 0) {
                await this.statusFileManager.setValue('retrievedPackages', false);
                await this.retrievePackages();
                return await this.addContactPointAndDeploy(++cnt);
            }
            fs.writeFileSync(
                processMetaFile,
                fs
                    .readFileSync(processMetaFile)
                    .toString()
                    .replace('<stringValue>0ZER000000004ZaOAI</stringValue>', `<stringValue>${storeId}</stringValue>`)
                    .replace('<status>Draft</status>', '<status>Active</status>')
            );
        }
        // Deploy Updated Store
        this.ux.log(msgs.getMessage('quickstart.setup.creatingPackageToDeployWithNewFlow'));
        if (!existsSync(`${this.storeDir}/experience-bundle-package/unpackaged/`))
            throw new SfdxError(
                'Something went wrong no experience bundle ' + `${this.storeDir}/experience-bundle-package/unpackaged/`
            );
        fs.copyFileSync(
            `${QUICKSTART_CONFIG()}/${StoreQuickstartSetup.getStoreType(
                this.org.getUsername(),
                this.flags['store-name'],
                this.ux
            ).toLowerCase()}-package-deploy-template.xml`,
            `${this.storeDir}/experience-bundle-package/unpackaged/package.xml`
        );
        // turn sharing rule metadata off by default
        if (!(this.varargs['isSharingRuleMetadataNeeded'] && this.varargs['isSharingRuleMetadataNeeded'] === 'true')) {
            let packageDeploy = XML.parse(
                fs.readFileSync(`${this.storeDir}/experience-bundle-package/unpackaged/package.xml`).toString()
            );
            packageDeploy['Package']['types'] = packageDeploy['Package']['types'].filter(
                (t) => t['members'] !== 'ProductCatalog' && t['members'] !== 'Product2'
            );
            fs.writeFileSync(
                `${this.storeDir}/experience-bundle-package/unpackaged/package.xml`,
                XML.stringify(packageDeploy)
            );
            ['ProductCatalog', 'Product2'].forEach((i) =>
                remove(`${this.storeDir}/experience-bundle-package/unpackaged/sharingRules/${i}.sharingRules`)
            );
        }
        shell(
            `cd "${this.storeDir}/experience-bundle-package/unpackaged" && rm -f "../${
                this.varargs['communityExperienceBundleName'] as string
            }ToDeploy.zip"; zip -r -X "../${this.varargs['communityExperienceBundleName'] as string}ToDeploy.zip" ./*`
        );
        this.ux.log(msgs.getMessage('quickstart.setup.deployNewZipWithFlowIgnoringWarningsCleanUp'));
        let res;
        try {
            res = shellJsonSfdx(
                `sfdx force:mdapi:deploy -u "${this.org.getUsername()}" -g -f "${
                    this.storeDir
                }/experience-bundle-package/${
                    this.varargs['communityExperienceBundleName'] as string
                }ToDeploy.zip" --wait -1 --verbose --singlepackage`
            );
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (JSON.stringify(e.message).indexOf(msgs.getMessage('quickstart.setup.checkInvalidSession')) >= 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.ux.log(msgs.getMessage('quickstart.setup.openingPageToRefreshSession', [e.message]));
                shell('sfdx force:org:open -u ' + this.org.getUsername());
                res = shellJsonSfdx(
                    `sfdx force:mdapi:deploy -u "${this.org.getUsername()}" -g -f "${
                        this.storeDir
                    }/experience-bundle-package/${
                        this.varargs['communityExperienceBundleName'] as string
                    }ToDeploy.zip" --wait -1 --verbose --singlepackage`
                );
            } else if (JSON.stringify(e.message).indexOf('Error parsing file') >= 0 && cnt === 0) {
                await this.statusFileManager.setValue('retrievedPackages', false);
                await this.retrievePackages();
                return await this.addContactPointAndDeploy(++cnt);
            } else throw e;
        }
        // Need to add here because: Error happens if done above, "Error: You can only select profiles that are associated with the experience."
        this.updateSelfRegProfile();
        this.ux.log(JSON.stringify(res));
        this.ux.log(msgs.getMessage('quickstart.setup.removingXmlFilesPackageForRetrievingAndDeployingMetadata'));
        const removeFiles = ['package-retrieve.xml', 'experience-bundle-package'];
        removeFiles.forEach((f) => remove(this.storeDir + '/' + f));
    }

    private async publishCommunity(): Promise<void> {
        if (await this.statusFileManager.getValue('communityPublished')) return;
        this.ux.log(msgs.getMessage('quickstart.setup.publishingCommunityStep7'));
        shell(
            `sfdx force:community:publish -u "${this.org.getUsername()}" -n "${
                this.varargs['communityNetworkName'] as string
            }"`
        );
        // TODO check if the publish is done before moving on
        await this.statusFileManager.setValue('communityPublished', true);
    }

    private async updateFlowAssociatedToCheckout(): Promise<void> {
        if (await this.statusFileManager.getValue('updatedFlowAssociatedToCheckout')) return;
        this.ux.log('Updating flow associated to checkout.');
        const checkoutMetaFolder = `${this.storeDir}/experience-bundle-package/unpackaged/experiences/${
            this.varargs['communityExperienceBundleName'] as string
        }/views/`;
        // Do a case insensitive grep and capture file
        const greppedFile = fs.readdirSync(checkoutMetaFolder).filter((f) => f.toLowerCase() === 'checkout.json')[0];
        // This determines the name of the main flow as it will always be the only flow to terminate in "Checkout.flow"
        const flowDir = this.storeDir + '/../force-app/main/default/flows';
        const mainFlowName = path
            .basename(fs.readdirSync(flowDir).filter((f) => f.endsWith('Checkout.flow-meta.xml'))[0])
            .split('.')[0];
        fs.writeFileSync(
            checkoutMetaFolder + '/' + greppedFile,
            fs
                .readFileSync(checkoutMetaFolder + '/' + greppedFile)
                .toString()
                .replace('sfdc_checkout__CheckoutTemplate', mainFlowName.toString())
        );
        await this.statusFileManager.setValue('updatedFlowAssociatedToCheckout', true);
    }
}
