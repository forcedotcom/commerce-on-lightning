/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { forceDataSoql, forceDataRecordCreate, forceDataRecordDelete } from '../../../lib/utils/sfdx/forceDataSoql';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { setApiVersion } from '../../../lib/utils/args/flagsUtils';
import { UtilStoreValidate } from './unmap';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'extension';
const CMD = `commerce:${TOPIC}:map`;
const msgs = Messages.loadMessages('@salesforce/commerce', 'extension');

export class MapExtension extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static description = msgs.getMessage('extension.map.cmdDescription');
    public static example = [
        `sfdx ${CMD} --registered-extension-name test-extension-name --store-name test-store-name `,
        `sfdx ${CMD} --registered-extension-name test-extension-name --store-id test-store-id `,
    ];
    public static flagsConfig = {
        'registered-extension-name': flags.string({
            char: 'r',
            description: msgs.getMessage('extension.map.regExtensionNameFlagDescription'),
        }),
        'store-name': flags.string({
            char: 'n',
            description: msgs.getMessage('extension.map.StoreNameFlagDescription'),
        }),
        'store-id': flags.string({
            char: 'i',
            description: msgs.getMessage('extension.map.storeId'),
        }),
    };
    public org: Org;
    public statusFileManager: StatusFileManager;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<string> {
        await setApiVersion(this.org, this.flags);
        this.ux.log(`Accessing Store using username: ${this.org.getUsername()} \n..........`);

        return this.processMapExtension(
            this.flags['registered-extension-name'],
            this.flags['store-name'],
            this.flags['store-id'],
            this.org.getUsername()
        );
    }

    /**
     * processMapExtension - Main method that calls helper functions to get webstore id and map an extension to that webstore. Any errors with undefined store id/store name or mismatched values will throw error and break command
     *
     * @param extensionName - registered-extension-name that user passes
     * @param storeName - user can pass EITHER storeName or storeId. name of webstore
     * @param storeId - a valid storeId of the webstore being mapped to.
     * @param userName - a valid username(email) that is used to login to the webstore.
     * @returns JSON response of confirmed inserted record into StoreIntegratedService table
     */

    public processMapExtension(extensionName: string, storeName: string, storeId: string, userName: string): string {
        if (storeName === undefined && storeId === undefined) {
            throw new SfdxError(msgs.getMessage('extension.map.undefinedName'));
        }
        const storeid = UtilStoreValidate.validateStoreId(storeName, storeId, userName, this.flags, this.logger);
        const registeredExternalServiceId = this.getRegisteredExtensionId(extensionName, userName);
        this.deleteDuplicateMaps(extensionName, userName, storeid);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const results = forceDataRecordCreate(
            'StoreIntegratedService',
            `Integration=${registeredExternalServiceId} StoreId=${storeid} ServiceProviderType='Extension'`,
            userName,
            this.flags,
            this.logger
        );

        if (results instanceof SfdxError) {
            throw new SfdxError(msgs.getMessage('extension.map.error', [extensionName, '\n', results.message]));
        }
        // JSON response of inserted record
        return this.getInsertedRecord(storeid, registeredExternalServiceId, extensionName);
    }

    private getRegisteredExtensionId(extensionName: string, userName: string): string {
        let registeredExternalServiceId: string;
        try {
            registeredExternalServiceId = forceDataSoql(
                `SELECT Id FROM RegisteredExternalService WHERE DeveloperName='${extensionName}'`,
                userName,
                this.flags,
                this.logger
            ).result.records[0].Id;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errorMsg = msgs.getMessage('extension.map.nonexistent', [extensionName, '\n', error.message]);
            throw new SfdxError(errorMsg);
        }
        return registeredExternalServiceId;
    }

    private getInsertedRecord(storeid: string, registeredExternalServiceId: string, extensionName: string): string {
        const StoreIntegratedTable = forceDataSoql(
            `SELECT Id,Integration,ServiceProviderType,StoreId from StoreIntegratedService WHERE StoreId= '${storeid}' and Integration='${registeredExternalServiceId}' limit 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        );
        const name = forceDataSoql(
            `SELECT Name FROM WebStore WHERE Id='${storeid}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Name;
        for (const record of StoreIntegratedTable.result.records) {
            const finalTable = {
                Id: record['Id'],
                Integration: record['Integration'] as string,
                StoreId: record['StoreId'] as string,
            };
            const returnResult = `${JSON.stringify(finalTable, null, 4)}\n`;
            this.ux.log(returnResult);
            this.ux.log(
                msgs.getMessage('extension.map.savingConfigIntoConfig', [
                    `'${extensionName}'`,
                    'to your webstore',
                    `'${name}'`,
                ])
            );
            return returnResult;
        }
    }
    private deleteDuplicateMaps(extensionName: string, userName: string, storeid: string): void {
        let epnVal: string;
        let deletedId: string;
        const EPNQuery = forceDataSoql(
            `SELECT ExtensionPointName FROM RegisteredExternalService WHERE DeveloperName='${extensionName}'`,
            userName,
            this.flags,
            this.logger
        );
        if (EPNQuery !== undefined && EPNQuery.result !== undefined && EPNQuery.result.totalSize > 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            epnVal = EPNQuery.result.records[0]['ExtensionPointName'];
        } else {
            throw new SfdxError(msgs.getMessage('extension.map.errorEPN'));
        }

        const existingIds = forceDataSoql(
            `SELECT DeveloperName,ExternalServiceProviderType FROM RegisteredExternalService WHERE ExtensionPointName='${epnVal}' AND ExternalServiceProviderType='Extension'`,
            userName,
            this.flags,
            this.logger
        );
        for (const record of existingIds.result.records) {
            const id = (record['ExternalServiceProviderType'] as string)
                .concat('__' as string)
                .concat(record['DeveloperName'] as string);
            const deleteId = forceDataSoql(
                `SELECT Id FROM StoreIntegratedService WHERE Integration='${id}' AND StoreId='${storeid}'`,
                userName,
                this.flags,
                this.logger
            ).result.records[0];
            if (deleteId !== undefined) {
                deletedId = deleteId.Id;
                this.ux.log(
                    msgs.getMessage('extension.map.previousEPN', [
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        `'${record['DeveloperName']}'`,
                        'because it was for the same EPN in this webstore',
                    ])
                );
                forceDataRecordDelete(
                    'StoreIntegratedService',
                    deletedId,
                    this.org.getUsername(),
                    this.flags,
                    this.logger,
                    'pipe'
                );
            }
        }
    }
}
