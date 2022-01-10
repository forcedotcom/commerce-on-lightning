/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { URL } from 'url';
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { allFlags } from '../../../lib/flags/commerce/all.flags';
import { filterFlags } from '../../../lib/utils/args/flagsUtils';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { forceDataSoql } from '../../../lib/utils/sfdx/forceDataSoql';
import { StoreCreate } from './create';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'store';
const CMD = `commerce:${TOPIC}:display`;
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class StoreDisplay extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static readonly supportsDevhubUsername = true;
    public static description = messages.getMessage('view.info.cmdDescription');
    public static examples = [`sfdx ${CMD} --store-name test-store`];
    protected static flagsConfig = filterFlags(['store-name', 'buyer-username', 'urlpathprefix'], allFlags);

    public org: Org;
    public statusFileManager: StatusFileManager;

    public async run(): Promise<AnyJson> {
        let devhub = (await this.org.getDevHubOrg()).getUsername();
        if (!devhub) devhub = 'Not Supplied';
        this.statusFileManager = new StatusFileManager(
            devhub,
            this.org.getUsername(),
            this.flags['store-name'] as string
        );
        return { res: await this.viewBuyerInfo() };
    }

    public async viewBuyerInfo(): Promise<boolean> {
        if (
            this.flags.urlpathprefix &&
            (this.flags.urlpathprefix as string).replace(/[\\W_]+/g, '') !== (this.flags.urlpathprefix as string)
        )
            throw new SfdxError('Flag urlpathprefix must contain only alphanumeric characters');
        const userInfo = await StoreCreate.getUserInfo(this.statusFileManager, this.flags['buyer-username']);
        if (!userInfo) throw new SfdxError(messages.getMessage('view.info.errorNoUserInfo'));
        const buyerPassword = userInfo.password ? userInfo.password : '';
        const fullStoreUrl = await this.getFullStoreURL();
        this.ux.log(
            messages.getMessage('view.info.storeUrlBuyerInfo', [
                fullStoreUrl,
                this.flags['buyer-username'],
                buyerPassword,
            ])
        );
        const config = {
            communityUrl: fullStoreUrl,
            username: this.flags['buyer-username'] as string,
            password: buyerPassword,
        };
        const configFile = `const config = ${JSON.stringify(config, null, 4)};\nmodule.exports = config;`;
        this.ux.log(
            messages.getMessage('view.info.savingConfigIntoConfig', ['commerce.config-override.js', configFile])
        );
        // fs.writeFileSync(B2C_CONFIG_OVERRIDE(), configFile); // Shall we resolve this query - 'should this write it to the scratch org directory?'
        return true;
    }

    private async getFullStoreURL(): Promise<string> {
        const fullStoreUrlKey = 'fullStoreUrl';
        const dInfo = await this.statusFileManager.getValue('fullStoreUrl');
        if (dInfo) return dInfo as string;
        if (!this.flags.urlpathprefix && (await this.statusFileManager.getValue('urlpathprefix')))
            this.flags.urlpathprefix = await this.statusFileManager.getValue('urlpathprefix');
        const urlpathprefix: string = this.flags.urlpathprefix
            ? (this.flags.urlpathprefix as string)
            : (this.flags['store-name'] as string).replace(/[\\W_]+/g, '');
        const domainInfo = forceDataSoql(
            `SELECT Domain.Domain FROM DomainSite WHERE PathPrefix='/${urlpathprefix}' limit 1`,
            this.org.getUsername()
        );
        if (
            !domainInfo.result.records ||
            domainInfo.result.records.length === 0 ||
            !domainInfo.result.records[0]['Domain']
        )
            throw new SfdxError(messages.getMessage('view.info.noStoreMatch', [this.flags['store-name']]));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        let domain = domainInfo.result.records[0]['Domain']['Domain'] as string;
        const instanceUrl = (await StoreCreate.getUserInfo(this.statusFileManager, this.flags['buyer-username']))
            .instanceUrl;
        const url = new URL(instanceUrl);
        url.hostname = domain;
        domain = url.toString() + `${urlpathprefix}`;
        await this.statusFileManager.setValue(fullStoreUrlKey, domain);
        return domain;
    }
}
