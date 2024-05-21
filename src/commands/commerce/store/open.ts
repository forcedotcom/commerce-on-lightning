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
import { filterFlags } from '../../../lib/utils/args/flagsUtils';
import { shell } from '../../../lib/utils/shell';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { appendCommonFlags, setApiVersion } from '../../../lib/utils/args/flagsUtils';
import { StoreCreate } from './create';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'store';
const CMD = `commerce:${TOPIC}:open`;
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class StoreOpen extends SfdxCommand {
    public static requiresUsername = true;
    public static readonly supportsDevhubUsername = true;
    public static description = messages.getMessage('view.cmdDescription');
    public static examples = [`sf ${CMD} --store-name test-store`, `sfdx ${CMD} --all`];
    protected static flagsConfig = filterFlags(['store-name', 'all'], allFlags);

    public org: Org;
    private statusFileManager: StatusFileManager;

    public async run(): Promise<AnyJson> {
        await setApiVersion(this.org, this.flags);
        if (this.flags.all) return { res: this.viewAll() };
        let devhub = (await this.org.getDevHubOrg()).getUsername();
        if (!devhub) devhub = 'Not Supplied';
        this.statusFileManager = new StatusFileManager(
            devhub,
            this.org.getUsername(),
            this.flags['store-name'] as string
        );
        const storeId = await StoreCreate.getStoreId(this.statusFileManager, this.flags, this.ux, this.logger);
        if (!storeId) throw new SfdxError(messages.getMessage('view.errorStoreId'));
        this.ux.log('Store id is: ' + storeId);
        shell(
            appendCommonFlags(
                `sf org open --path "/lightning/r/WebStore/${storeId}/view" --target-org ${this.org.getUsername()}`,
                this.flags,
                this.logger
            )
        );
        return { storeId };
    }

    public viewAll(): boolean {
        shell(
            appendCommonFlags(
                `sf org open --target-org ${this.org.getUsername()} --path _ui/networks/setup/SetupNetworksPage`,
                this.flags,
                this.logger
            )
        );
        return true;
    }
}
