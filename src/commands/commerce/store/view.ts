/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { allFlags } from '../../../lib/flags/commerce/all.flags';
import { addAllowedArgs, filterFlags } from '../../../lib/utils/args/flagsUtils';
import { shell } from '../../../lib/utils/shell';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { StoreCreate } from './create';
import { StoreViewInfo } from './view/info';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'store';
const CMD = `commerce:${TOPIC}:view`;
const messages = Messages.loadMessages('commerce', TOPIC);

export class StoreView extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static readonly requiresDevhubUsername = true;
    public static description = messages.getMessage('view.cmdDescription');
    public static examples = [`sfdx ${CMD}`];
    protected static flagsConfig = filterFlags(['store-name'], allFlags);

    public org: Org;

    public async run(): Promise<AnyJson> {
        const storeId = await StoreCreate.getStoreId(
            new StatusFileManager(
                (await this.org.getDevHubOrg()).getUsername(),
                this.org.getUsername(),
                this.flags['store-name'] as string
            ),
            this.ux
        );
        if (!storeId) throw new SfdxError(messages.getMessage('view.errorStoreId'));
        this.ux.log('Store id is: ' + storeId);
        await StoreViewInfo.run(addAllowedArgs(this.argv, StoreViewInfo), this.config);
        shell(
            `SFDX_DOMAIN_RETRY=5 sfdx force:org:open -p "/lightning/r/WebStore/${storeId}/view" -u ${this.org.getUsername()}`
        );
        return { storeId };
    }
}
