/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Logger, Messages, Org, SfdxError } from '@salesforce/core';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { OutputFlags } from '@oclif/parser';
import { forceDataSoql, forceDataRecordDelete } from '../../../lib/utils/sfdx/forceDataSoql';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { Result } from '../../../lib/utils/jsonUtils';
import { setApiVersion } from '../../../lib/utils/args/flagsUtils';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'extension';
const CMD = `commerce:${TOPIC}:unmap`;
const msgs = Messages.loadMessages('@salesforce/commerce', 'extension');

export class UnMapExtension extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static description = msgs.getMessage('extension.unmap.cmdDescription');
    public static example = [
        `sf ${CMD} --registered-extension-name test-extension-name --store-name test-store-name `,
        `sf ${CMD} --registered-extension-name test-extension-name --store-id test-store-id `,
    ];
    public static flagsConfig = {
        'registered-extension-name': flags.string({
            char: 'r',
            description: msgs.getMessage('extension.unmap.regExtensionNameFlagDescription'),
        }),
        'store-name': flags.string({
            char: 'n',
            description: msgs.getMessage('extension.unmap.StoreNameFlagDescription'),
        }),
        'store-id': flags.string({
            char: 'i',
            description: msgs.getMessage('extension.unmap.storeId'),
        }),
    };
    public org: Org;
    public statusFileManager: StatusFileManager;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<void> {
        await setApiVersion(this.org, this.flags);
        this.unmapRecord(
            this.flags['registered-extension-name'],
            this.flags['store-name'],
            this.flags['store-id'],
            this.org.getUsername()
        );
    }

    public unmapRecord(extensionName: string, storeName: string, storeId: string, userName: string): void {
        if (storeName === undefined && storeId === undefined) {
            throw new SfdxError(msgs.getMessage('extension.unmap.undefinedName'));
        }
        const storeid = UtilStoreValidate.validateStoreId(storeName, storeId, userName, this.flags, this.logger);
        const name = forceDataSoql(
            `SELECT Name FROM WebStore WHERE Id='${storeid}' LIMIT 1`,
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Name;
        let deletedId: string;
        const existingIds = forceDataSoql(
            `SELECT Id FROM RegisteredExternalService WHERE DeveloperName='${extensionName}' AND ExternalServiceProviderType='Extension'`,
            userName,
            this.flags,
            this.logger
        );
        if (existingIds.result !== undefined && existingIds.result.totalSize === 0) {
            throw new SfdxError(msgs.getMessage('extension.unmap.error', [extensionName, '\n', existingIds.message]));
        }
        for (const record of existingIds.result.records) {
            const id = record['Id'];
            const deleteId = forceDataSoql(
                `SELECT Id FROM StoreIntegratedService WHERE Integration='${id}' AND StoreId='${storeid}'`,
                userName,
                this.flags,
                this.logger
            ).result.records[0];
            deletedId = deleteId.Id;
            forceDataRecordDelete(
                'StoreIntegratedService',
                deletedId,
                this.org.getUsername(),
                this.flags,
                this.logger,
                'pipe'
            );
            this.ux.log(
                msgs.getMessage('extension.unmap.savingConfigIntoConfig', [
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `'${record['DeveloperName']}'`,
                    'from your webstore',
                    `'${name}'`,
                ])
            );
        }
    }
}

export class UtilStoreValidate {
    public static validateStoreId(
        storeName: string,
        storeId: string,
        userName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        passedFlags: OutputFlags<any>,
        logger: Logger
    ): string {
        let fResult: Result<QueryResult>;
        if (storeId === undefined) {
            fResult = forceDataSoql(`SELECT Id FROM WebStore WHERE Name='${storeName}'`, userName, passedFlags, logger);
            if (fResult !== undefined && fResult.result !== undefined) {
                if (fResult.result.totalSize > 1) {
                    throw new SfdxError(msgs.getMessage('extension.map.multiple', [storeName]));
                } else if (fResult.result.totalSize === 0) {
                    throw new SfdxError(msgs.getMessage('extension.map.errStoreName', [storeName]));
                } else {
                    storeId = fResult.result.records[0].Id;
                }
            }
        } else {
            try {
                storeId = forceDataSoql(
                    `SELECT Id FROM WebStore WHERE Id='${storeId}' LIMIT 1`,
                    userName,
                    passedFlags,
                    logger
                ).result.records[0].Id;
            } catch (e) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new SfdxError(msgs.getMessage('extension.map.errStoreId', [storeId, '\n', e.message]));
            }
        }
        return storeId;
    }
}
