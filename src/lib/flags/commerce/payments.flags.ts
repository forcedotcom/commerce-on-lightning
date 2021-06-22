/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const TOPIC = 'payments';
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export const paymentsFlags = {
    'payment-adapter': flags.string({
        char: 'p',
        default: 'Stripe', // TODO add list of allowed adapters here
        description: messages.getMessage('paymentsFlags.paymentAdapterDescription'),
    }),
};
