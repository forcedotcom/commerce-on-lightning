/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// What: Implemented a register command which registers an apex class via EPN to a web store

// Why: Store admins will now be able to run through the full workflow of registering their Apex class from their command line
// rather than via workbench or running custom apex code

// How: command triggers query to retrieve apex class -> inserts fields into RegisteredExternalServiceTable -> returns a json response of current inserted record

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { forceDataRecordCreate, forceDataSoql } from '../../../lib/utils/sfdx/forceDataSoql';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { setApiVersion } from '../../../lib/utils/args/flagsUtils';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'extension';
const CMD = `commerce:${TOPIC}:register`;
const msgs = Messages.loadMessages('@salesforce/commerce', 'store');

export class RegisterExtension extends SfdxCommand {
    public static readonly requiresUsername = true;
    // Setting specific flags
    public static description = msgs.getMessage('extension.register.cmdDescription');
    public static example = [
        `sfdx ${CMD} --registered-extension-name test-extension-name --extension-point-name test-epn --apex-class-name test-apex-class`,
    ];
    public static flagsConfig = {
        'registered-extension-name': flags.string({
            char: 'r',
            description: msgs.getMessage('extension.register.regExtensionNameFlagDescription'),
        }),
        'extension-point-name': flags.string({
            char: 'e',
            description: msgs.getMessage('extension.register.extensionPointNameDescription'),
        }),
        'apex-class-name': flags.string({
            char: 'a',
            description: msgs.getMessage('extension.register.apexClassNameFlagDescription'),
        }),
        // optional flag
        'apex-namespace': flags.string({
            char: 'm',
            description: msgs.getMessage('extension.register.apexNameSpaceFlagDescription'),
        }),
        description: flags.string({
            char: 'd',
            description: msgs.getMessage('extension.register.apexClassDescriptionFieldMessage'),
        }),
        'icon-uri': flags.string({
            description: msgs.getMessage('extension.register.apexClassIconURIDescription'),
        }),
        'is-application': flags.boolean({
            description: msgs.getMessage('extension.register.apexClassisApplicationDescription'),
        }),
    };

    public org: Org;
    public statusFileManager: StatusFileManager;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<unknown> {
        await setApiVersion(this.org, this.flags);
        this.ux.log(
            `Retrieving Apex Class '${
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                this.flags['apex-class-name']
            }' using username: ${this.org.getUsername()} \n..........`
        );
        return {
            res: this.registerApex(
                this.flags['registered-extension-name'],
                this.flags['extension-point-name'],
                this.flags['apex-class-name'],
                this.org.getUsername(),
                this.flags['description'],
                this.flags['icon-uri'],
                this.flags['is-application']
            ),
        };
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public registerApex(
        storeRegisteredName: string,
        storeEPN: string,
        storeApexClass: string,
        storeUserName: string,
        apexDescription?: string,
        iconURI?: string,
        isApplication?: boolean
    ): string {
        // get apexClass id from table
        const apexClassId = this.getApexClass(storeApexClass, storeUserName);

        // checks if user passed valid EPN
        const epnVal = forceDataSoql(
            `SELECT Value FROM PicklistValueInfo WHERE Value='${storeEPN}' AND EntityParticle.DurableId = 'RegisteredExternalService.ExtensionPointName' LIMIT 1`,
            storeUserName,
            this.flags,
            this.logger
        );
        if (epnVal.result.totalSize === 0) {
            throw new SfdxError(msgs.getMessage('extension.register.errEPN'));
        }
        if (storeRegisteredName === undefined) {
            throw new SfdxError(msgs.getMessage('extension.register.undefinedName'));
        }

        const recordValues = [
            `DeveloperName=${storeRegisteredName}`,
            `MasterLabel=${storeRegisteredName}`,
            `ExtensionPointName=${storeEPN}`,
            `ExternalServiceProviderId=${apexClassId}`,
            "ExternalServiceProviderType='Extension'",
        ];

        if (apexDescription !== undefined) recordValues.push(`Description='${apexDescription}'`);

        if (iconURI !== undefined) recordValues.push(`IconURI=${iconURI}`);

        if (isApplication !== undefined) recordValues.push(`isApplication=${isApplication.toString()}`);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const results = forceDataRecordCreate(
            'RegisteredExternalService',
            recordValues.join(' '),
            storeUserName,
            this.flags,
            this.logger
        );
        // Validates/checks for already existing unique name?
        if (results instanceof SfdxError) {
            throw new SfdxError(
                msgs.getMessage('extension.register.error', [storeRegisteredName, '\n', results.message])
            );
        }
        // JSON response of inserted record
        return this.getInsertedRecord(storeRegisteredName, storeApexClass, storeUserName);
    }

    // Queries for apexclassId from existing apexClass table
    private getApexClass(storeApexClass: string, storeUserName: string): string {
        let apexClassId: string;
        try {
            apexClassId = forceDataSoql(
                `SELECT Id FROM ApexClass WHERE Name='${storeApexClass}' LIMIT 1`,
                storeUserName,
                this.flags,
                this.logger
            ).result.records[0].Id;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errorMsg = msgs.getMessage('extension.register.errApexClass', [storeApexClass, '\n', error.message]);
            throw new SfdxError(errorMsg);
        }
        return apexClassId;
    }
    // returns entire record from RegisteredExternalService in JSON format
    private getInsertedRecord(storeRegisteredName: string, storeApexClass: string, storeUserName: string): string {
        const RegisteredTable = forceDataSoql(
            `SELECT FIELDS(ALL) from RegisteredExternalService WHERE DeveloperName='${storeRegisteredName}' LIMIT 1`,
            storeUserName,
            this.flags,
            this.logger
        );

        for (const element of RegisteredTable.result.records) {
            const finalTable = {
                UniqueExtensionId: element['Id'],
                ApexClassId: element['ExternalServiceProviderId'] as string,
                RegisteredExtensionName: element['DeveloperName'] as string,
                ExtensionPointName: element['ExtensionPointName'] as string,
                ExternalServiceProviderType: element['ExternalServiceProviderType'] as string,
            };
            if ('Description' in element) finalTable['Description'] = element['Description'] as string;

            if ('IconUri' in element) finalTable['IconURI'] = element['IconUri'] as string;

            if ('IsApplication' in element) finalTable['IsApplication'] = element['IsApplication'] as string;

            const returnResult = `${JSON.stringify(finalTable, null, 4)}\n`;
            this.ux.log(`${returnResult}`);
            this.ux.log(msgs.getMessage('extension.register.savingConfigIntoConfig'));
            return returnResult;
        }
    }
}
