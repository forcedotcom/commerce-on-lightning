/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { shell } from '../../../../lib/utils/shell';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'store';
const CMD = `commerce:${TOPIC}:view:all`;
const messages = Messages.loadMessages('commerce', TOPIC);

export class StoreViewAll extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static description = messages.getMessage('view.all.cmdDescription');

    public static examples = [`sfdx ${CMD}`]; // TODO documentation including examples and descriptions

    public org: Org;
    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<AnyJson> {
        shell(
            `SFDX_DOMAIN_RETRY=5 sfdx force:org:open -u ${this.org.getUsername()} -p _ui/networks/setup/SetupNetworksPage`
        );
        return { viewedAll: true };
    }
}
