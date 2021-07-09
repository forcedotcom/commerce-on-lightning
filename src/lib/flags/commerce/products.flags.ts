/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { EXAMPLE_DIR } from '../../utils/constants/properties';

Messages.importMessagesDirectory(__dirname);
const TOPIC = 'products';
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export const productsFlags = {
    'products-file-csv': flags.string({
        char: 'c',
        default: `${EXAMPLE_DIR}/csv/Alpine-small.csv`,
        description: messages.getMessage('productsFlags.productsFileCsvDescription'),
    }),
};
