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
        this.printEPN();
    }

    public printEPN(): void {
        this.ux.log('Getting all ExtensionPointName values \n..........');
        const domainInfo = forceDataSoql(
            "SELECT Value, IsDefaultValue, IsActive FROM PicklistValueInfo WHERE EntityParticle.DurableId = 'RegisteredExternalService.ExtensionPointName'",
            this.org.getUsername(),
            this.flags,
            this.logger
        );
        // iterates through picklist to show availabe EPN vals
        for (const element of domainInfo.result.records) {
            this.ux.log(element['Value']);
        }
    }
}
