/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const TOPIC = 'store';
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export const storeFlags = {
    templatename: flags.string({
        char: 't',
        default: 'b2c-lite-storefront',
        description: messages.getMessage('setup.templateNameDescription'),
    }),
    'buyer-username': flags.string({
        char: 'b',
        default: 'buyer@1commerce.com',
        description: messages.getMessage('setup.scratchOrgBuyerUsernameDescription'),
    }),
    'buyer-alias': flags.string({
        char: 'a',
        default: 'buyer',
        description: messages.getMessage('setup.buyerAliasDescription'),
    }),
    'buyer-email': flags.string({
        char: 'e',
        default: `${os.userInfo().username}+\${scratchOrgBuyerUsername.replace("@","AT")}@salesforce.com`,
        description: messages.getMessage('setup.buyerEmailDescription'),
    }),
    'store-name': flags.string({
        char: 'n',
        default: '1commerce',
        description: messages.getMessage('setup.storeNameDescription'),
        required: true,
    }),
    urlpathprefix: flags.string({
        char: 'p',
        description:
            'required if different from store-name URL to append to the domain created when Experiences was enabled for this org',
    }),
    all: flags.boolean({
        default: false,
        description: 'View All stores using sfdx force:org:open _ui/networks/setup/SetupNetworksPage page',
    }),
};
