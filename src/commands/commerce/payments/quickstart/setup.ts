/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { paymentsFlags } from '../../../../lib/flags/commerce/payments.flags';
import { storeFlags } from '../../../../lib/flags/commerce/store.flags';
import { addAllowedArgs, filterFlags, modifyArgFlag } from '../../../../lib/utils/args/flagsUtils';
import { STORE_DIR, FILE_COPY_ARGS, EXAMPLE_DIR } from '../../../../lib/utils/constants/properties';
import { forceDataRecordCreate, forceDataRecordDelete, forceDataSoql } from '../../../../lib/utils/sfdx/forceDataSoql';
import { shell, shellJsonSfdx } from '../../../../lib/utils/shell';
import { StoreQuickstartSetup } from '../../store/quickstart/setup';
import { FilesCopy } from '../../files/copy';
import { StatusFileManager } from '../../../../lib/utils/statusFileManager';
import { appendCommonFlags, setApiVersion } from '../../../../lib/utils/args/flagsUtils';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'payments';
const CMD = `commerce:${TOPIC}:quickstart:setup`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class PaymentsQuickstartSetup extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static description = msgs.getMessage('quickstart.setup.cmdDescription');

    public static examples = [`sf ${CMD} -p Stripe -n 1commerce`]; // TODO documentation including examples and descriptions
    protected static flagsConfig = {
        ...paymentsFlags,
        ...filterFlags(['store-name', 'prompt'], storeFlags),
    };
    public org: Org;
    private statusFileManager: StatusFileManager;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<AnyJson> {
        await setApiVersion(this.org, this.flags);
        // Copy all example files
        FILE_COPY_ARGS.forEach((v) => modifyArgFlag(v.args, v.value, this.argv));
        await FilesCopy.run(addAllowedArgs(this.argv, FilesCopy), this.config);
        const devHubUsername = (await this.org.getDevHubOrg()).getUsername();
        const storeName = this.flags['store-name'] as string;
        const selection = this.flags['payment-adapter'] as string;
        const namedCredentialMasterLabel = selection;
        const paymentGatewayAdapterName = `${selection}Adapter`;
        const paymentGatewayProviderName = `${selection}PGP`;
        const paymentGatewayName = `${selection}PG`;

        const examplesDir = `${EXAMPLE_DIR}/${StoreQuickstartSetup.getStoreType(
            this.org.getUsername(),
            this.flags,
            this.ux,
            this.logger
        ).toLowerCase()}/checkout/payment-gateway-integration/${selection[0].toUpperCase() + selection.substr(1)}/`;

        this.statusFileManager = new StatusFileManager(devHubUsername, this.org.getUsername(), storeName);

        const storeDir = STORE_DIR(
            undefined,
            devHubUsername,
            this.statusFileManager.scratchOrgAdminUsername,
            storeName
        );

        this.ux.log(msgs.getMessage('quickstart.setup.pushingNamedCredentialsAndGatewayAdapterApexToOrg'));
        this.ux.log(
            JSON.stringify(
                shellJsonSfdx(
                    appendCommonFlags(
                        `sf project deploy start --target-org "${this.org.getUsername()}" --metadata-dir ${examplesDir} --wait 1`,
                        this.flags,
                        this.logger
                    ),
                    null,
                    storeDir
                ),
                null,
                4
            )
        );
        // Creating Payment Gateway Provider
        const apexClassIdRecord = forceDataSoql(
            `SELECT Id FROM ApexClass WHERE Name='${paymentGatewayAdapterName}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records;
        if (!apexClassIdRecord || apexClassIdRecord.length === 0)
            throw new SfdxError(
                msgs.getMessage('quickstart.setup.errorNoResultsForQuery') +
                    `SELECT Id FROM ApexClass WHERE Name='${paymentGatewayAdapterName}'`
            );
        const apexClassId = apexClassIdRecord[0].Id;
        this.ux.log(
            msgs.getMessage('quickstart.setup.creatingPaymentGatewayProviderRecordUsing') +
                `ApexAdapterId=${apexClassId}.`
        );
        forceDataRecordCreate(
            'PaymentGatewayProvider',
            `DeveloperName=${paymentGatewayProviderName} ApexAdapterId=${apexClassId} MasterLabel=${paymentGatewayProviderName} IdempotencySupported=Yes Comments=Comments`,
            this.org.getUsername(),
            this.flags,
            this.logger
        );
        // Creating Payment Gateway
        const paymentGatewayProviderId = forceDataSoql(
            `SELECT Id FROM PaymentGatewayProvider WHERE DeveloperName='${paymentGatewayProviderName}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Id;
        let namedCredentialId = forceDataSoql(
            `SELECT Id FROM NamedCredential WHERE MasterLabel='${namedCredentialMasterLabel}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Id;
        this.ux.log(
            msgs.getMessage(
                'quickstart.setup.CreatingPaymentGatewayRecordUsingMerchantCredentialIdPaymentGatewayProviderId',
                [namedCredentialId, paymentGatewayProviderId]
            )
        );
        forceDataRecordCreate(
            'PaymentGateway',
            `MerchantCredentialId=${namedCredentialId} PaymentGatewayName=${paymentGatewayName} PaymentGatewayProviderId=${paymentGatewayProviderId} Status=Active`,
            this.org.getUsername(),
            this.flags,
            this.logger
        );
        // Creating Store Integrated Service
        const storeId = forceDataSoql(
            `SELECT Id FROM WebStore WHERE Name='${this.flags['store-name'] as string}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Id;
        const serviceMappingId = forceDataSoql(
            `SELECT Id FROM StoreIntegratedService WHERE StoreId='${storeId}' AND ServiceProviderType='Payment' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Id;
        if (serviceMappingId) {
            this.ux.log(msgs.getMessage('quickstart.setup.theStoreMappingAlreadyExistsDeletingOldMpping'));
            forceDataRecordDelete(
                'StoreIntegratedService',
                serviceMappingId,
                this.org.getUsername(),
                this.flags,
                this.logger
            );
        }
        // do we really need to get storeId again here?         const storeId = forceDataSoql(`SELECT Id FROM WebStore WHERE Name='${this.devHubConfig.scratchOrgStoreName}' LIMIT 1`, this.org.getUsername).result.records[0].Id
        const paymentGatewayId = forceDataSoql(
            `SELECT Id FROM PaymentGateway WHERE PaymentGatewayName='${paymentGatewayName}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Id;
        this.ux.log(
            msgs.getMessage('quickstart.setup.creatingStoreIntegratedServiceUsingStoreIntegration', [
                this.flags['store-name'] as string,
                paymentGatewayId,
                'PaymentGatewayId',
            ])
        );
        forceDataRecordCreate(
            'StoreIntegratedService',
            `Integration=${paymentGatewayId} StoreId=${storeId} ServiceProviderType=Payment`,
            this.org.getUsername(),
            this.flags,
            this.logger
        );
        // To set store mapping to a different Gateway see Store Integrations or run:"
        // force:org:open -p /lightning/page/storeDetail?lightning__webStoreId=$storeId."
        namedCredentialId = forceDataSoql(
            `SELECT Id FROM NamedCredential WHERE MasterLabel='${namedCredentialMasterLabel}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Id;
        this.ux.log(msgs.getMessage('quickstart.setup.namedCredentialWasCreatedUpdateItWithValidUsernamePassword'));
        shell(
            appendCommonFlags(
                `sf org open --target-org ${this.org.getUsername()} --path "lightning/setup/NamedCredential/page?address=%2F${namedCredentialId}"`,
                this.flags,
                this.logger
            )
        );
        return { quickstartSetupComplete: true };
    }
}
