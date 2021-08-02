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
import { filterFlags } from '../../../../lib/utils/args/flagsUtils';
import { EXAMPLE_DIR } from '../../../../lib/utils/constants/properties';
import { forceDataRecordCreate, forceDataRecordDelete, forceDataSoql } from '../../../../lib/utils/sfdx/forceDataSoql';
import { shell, shellJsonSfdx } from '../../../../lib/utils/shell';
import { StoreQuickstartSetup } from '../../store/quickstart/setup';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'payments';
const CMD = `commerce:${TOPIC}:quickstart:setup`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class PaymentsQuickstartSetup extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static description = msgs.getMessage('quickstart.setup.cmdDescription');

    public static examples = [`sfdx ${CMD} -p Stripe`]; // TODO documentation including examples and descriptions
    protected static flagsConfig = {
        ...paymentsFlags,
        ...filterFlags(['store-name'], storeFlags),
    };
    public org: Org;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<AnyJson> {
        const selection = this.flags['payment-adapter'] as string;
        const namedCredentialMasterLabel = selection;
        const paymentGatewayAdapterName = `${selection}Adapter`;
        const paymentGatewayProviderName = `${selection}PGP`;
        const paymentGatewayName = `${selection}PG`;
        const examplesDir = `${EXAMPLE_DIR}/${StoreQuickstartSetup.getStoreType(
            this.org.getUsername(),
            this.flags['store-name'],
            this.ux
        ).toLowerCase()}/checkout/payment-gateway-integration/${selection[0].toUpperCase() + selection.substr(1)}/`;
        this.ux.log(
            msgs.getMessage('quickstart.setup.settingUpGatewayConvertingNamedCredentialsGatewayAdapterApex', [
                selection,
            ])
        );
        this.ux.log(JSON.stringify(shellJsonSfdx(`sfdx force:mdapi:convert -r ${examplesDir}`), null, 4));
        this.ux.log(msgs.getMessage('quickstart.setup.pushingNamedCredentialsAndGatewayAdapterApexToOrg'));
        this.ux.log(JSON.stringify(shellJsonSfdx(`sfdx force:source:push -f -u "${this.org.getUsername()}"`), null, 4));
        // Creating Payment Gateway Provider
        const apexClassIdRecord = forceDataSoql(
            `SELECT Id FROM ApexClass WHERE Name='${paymentGatewayAdapterName}' LIMIT 1`,
            this.org.getUsername()
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
            this.org.getUsername()
        );
        // Creating Payment Gateway
        const paymentGatewayProviderId = forceDataSoql(
            `SELECT Id FROM PaymentGatewayProvider WHERE DeveloperName='${paymentGatewayProviderName}' LIMIT 1`,
            this.org.getUsername()
        ).result.records[0].Id;
        let namedCredentialId = forceDataSoql(
            `SELECT Id FROM NamedCredential WHERE MasterLabel='${namedCredentialMasterLabel}' LIMIT 1`,
            this.org.getUsername()
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
            this.org.getUsername()
        );
        // Creating Store Integrated Service
        const storeId = forceDataSoql(
            `SELECT Id FROM WebStore WHERE Name='${this.flags['store-name'] as string}' LIMIT 1`,
            this.org.getUsername()
        ).result.records[0].Id;
        const serviceMappingId = forceDataSoql(
            `SELECT Id FROM StoreIntegratedService WHERE StoreId='${storeId}' AND ServiceProviderType='Payment' LIMIT 1`,
            this.org.getUsername()
        ).result.records[0].Id;
        if (serviceMappingId) {
            this.ux.log(msgs.getMessage('quickstart.setup.theStoreMappingAlreadyExistsDeletingOldMpping'));
            forceDataRecordDelete('StoreIntegratedService', serviceMappingId, this.org.getUsername());
        }
        // do we really need to get storeId again here?         const storeId = forceDataSoql(`SELECT Id FROM WebStore WHERE Name='${this.devHubConfig.scratchOrgStoreName}' LIMIT 1`, this.org.getUsername).result.records[0].Id
        const paymentGatewayId = forceDataSoql(
            `SELECT Id FROM PaymentGateway WHERE PaymentGatewayName='${paymentGatewayName}' LIMIT 1`,
            this.org.getUsername()
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
            this.org.getUsername()
        );
        // To set store mapping to a different Gateway see Store Integrations or run:"
        // force:org:open -p /lightning/page/storeDetail?lightning__webStoreId=$storeId."
        namedCredentialId = forceDataSoql(
            `SELECT Id FROM NamedCredential WHERE MasterLabel='${namedCredentialMasterLabel}' LIMIT 1`,
            this.org.getUsername()
        ).result.records[0].Id;
        this.ux.log(msgs.getMessage('quickstart.setup.namedCredentialWasCreatedUpdateItWithValidUsernamePassword'));
        shell(
            `sfdx force:org:open -u ${this.org.getUsername()} -p "lightning/setup/NamedCredential/page?address=%2F${namedCredentialId}"`
        );
        return { quickstartSetupComplete: true };
    }
}
