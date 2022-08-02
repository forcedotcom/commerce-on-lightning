/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { forceDataSoql } from '../../../../lib/utils/sfdx/forceDataSoql';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'extension';
const CMD = `commerce:${TOPIC}:getEPN`;
const msgs = Messages.loadMessages('@salesforce/commerce', 'store');

export class getEPN extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static example = [`sfdx ${CMD}`];

    public static description = msgs.getMessage('extension.getEPN.cmdDescription');
    public org: Org;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<void> {
        this.ux.log(`Getting all ExtensionPointName values using username: ${this.org.getUsername()} \n..........`);
        const domainInfo = forceDataSoql(
            "SELECT Value, Label, IsDefaultValue, IsActive FROM PicklistValueInfo WHERE EntityParticle.DurableId = 'RegisteredExternalService.ExtensionPointName'"
        );
        // iterates through picklist to show availabe EPN vals
        this.ux.log('PICKLIST Value Table:', '\n');

        for (const element of domainInfo.result.records) {
            this.ux.log('Value:', element['Value']);
            this.ux.log('Label:', element['Label']);
            this.ux.log('IsActive:', element['IsActive']);
            this.ux.log('IsDefaultValue:', element['IsDefaultValue'], '\n');
        }
    }
}
