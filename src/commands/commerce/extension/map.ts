/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { forceDataSoql, forceDataRecordCreate, forceDataRecordDelete } from '../../../lib/utils/sfdx/forceDataSoql';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { Result } from '../../../lib/utils/jsonUtils';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'extension';
const CMD = `commerce:${TOPIC}:map`;
const msgs = Messages.loadMessages('@salesforce/commerce', 'store');

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
        this.ux.log(`Accessing Store using username: ${this.org.getUsername()} \n..........`);

        return this.processMapExtension(
            this.flags['registered-extension-name'],
            this.flags['store-name'],
            this.flags['store-id'],
            this.org.getUsername()
        );
    }

    public processMapExtension(extensionName: string, storeName: string, storeId: string, userName: string): string {
        if (storeName === undefined && storeId === undefined) {
            throw new SfdxError(msgs.getMessage('extension.map.undefinedName'));
        }
        const storeid = this.validateStoreId(storeName, storeId, userName);
        const registeredExternalServiceId = this.getRegisteredExtensionId(extensionName, userName);
        this.deleteDuplicateMaps(extensionName, userName, storeid);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const results = forceDataRecordCreate(
            'StoreIntegratedService',
            `Integration=${registeredExternalServiceId} StoreId=${storeid} ServiceProviderType='Extension'`,
            userName
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
                userName
            ).result.records[0].Id;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errorMsg = msgs.getMessage('extension.map.nonexistent', [extensionName, '\n', error.message]);
            throw new SfdxError(errorMsg);
        }
        return registeredExternalServiceId;
    }

    private validateStoreId(storeName: string, storeId: string, userName: string): string {
        let fResult: Result<QueryResult>;
        if (storeId === undefined) {
            fResult = forceDataSoql(`SELECT Id FROM WebStore WHERE Name='${storeName}'`, userName);
            if (fResult !== undefined && fResult.result !== undefined) {
                if (fResult.result.totalSize > 1) {
                    throw new SfdxError(msgs.getMessage('extension.map.errMultipleStoreWithSameName', [storeName]));
                } else if (fResult.result.totalSize === 0) {
                    throw new SfdxError(msgs.getMessage('extension.map.errStoreName', [storeName]));
                } else {
                    storeId = fResult.result.records[0].Id;
                }
            }
        } else {
            try {
                storeId = forceDataSoql(`SELECT Id FROM WebStore WHERE Id='${storeId}' LIMIT 1`, userName).result
                    .records[0].Id;
            } catch (e) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new SfdxError(msgs.getMessage('extension.map.errStoreId', [storeId, '\n', e.message]));
            }
        }
        return storeId;
    }

    private getInsertedRecord(storeid: string, registeredExternalServiceId: string, extensionName: string): string {
        const StoreIntegratedTable = forceDataSoql(
            `SELECT Id,Integration,ServiceProviderType,StoreId from StoreIntegratedService WHERE StoreId= '${storeid}' and Integration='${registeredExternalServiceId}' limit 1`
        );
        const name = forceDataSoql(`SELECT Name FROM WebStore WHERE Id='${storeid}' LIMIT 1`).result.records[0].Name;
        for (const element of StoreIntegratedTable.result.records) {
            const finalTable = {
                Id: element['Id'],
                Integration: element['Integration'] as string,
                StoreId: element['StoreId'] as string,
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
        const EPNQuery = forceDataSoql(
            `SELECT ExtensionPointName FROM RegisteredExternalService WHERE DeveloperName='${extensionName}'`,
            userName
        );
        if (EPNQuery !== undefined && EPNQuery.result !== undefined && EPNQuery.result.totalSize > 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            epnVal = EPNQuery.result.records[0]['ExtensionPointName'];
        } else {
            throw new SfdxError(msgs.getMessage('extension.map.errorEPN'));
        }

        const existingIds = forceDataSoql(
            `SELECT DeveloperName,ExternalServiceProviderType FROM RegisteredExternalService WHERE ExtensionPointName='${epnVal}' AND ExternalServiceProviderType='Extension'`,
            userName
        );
        for (const element of existingIds.result.records) {
            const id = (element['ExternalServiceProviderType'] as string)
                .concat('__' as string)
                .concat(element['DeveloperName'] as string);
            try {
                const deleteId = forceDataSoql(
                    `SELECT Id FROM StoreIntegratedService WHERE Integration='${id}' AND StoreId='${storeid}'`,
                    userName
                ).result.records[0].Id;
                if (deleteId !== undefined) {
                    this.ux.log(msgs.getMessage('extension.map.previousEPN', [`'${id}'`, 'due to duplicate EPN']));
                    forceDataRecordDelete('StoreIntegratedService', deleteId, this.org.getUsername(), 'ignore');
                }
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }
    }
}
