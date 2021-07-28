/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { BASE_DIR, CONFIG_DIR } from '../../utils/constants/properties';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'examples';
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export const exampleFlags = {
    definitionfile: flags.filepath({
        char: 'f',
        default: CONFIG_DIR + '/store-scratch-def.json',
        description: messages.getMessage('convertFlags.configFileDescription'),
    }),
    outputdir: flags.string({
        char: 'd',
        default: BASE_DIR + '/force-app',
        description: messages.getMessage('convertFlags.outputDirDescription'),
    }),
    sourcepath: flags.string({
        char: 'p',
        multiple: true,
        default: '',
        description: messages.getMessage('convertFlags.convertDescription'),
    }),
    type: flags.string({
        char: 'o',
        options: ['b2c', 'b2b'],
        parse: (input) => input.toLowerCase(),
        default: 'b2c',
        description: 'The type of store you want to create',
    }),
};
