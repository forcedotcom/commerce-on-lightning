/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { exampleFlags } from './convert.flags';
import { paymentsFlags } from './payments.flags';
import { productsFlags } from './products.flags';
import { storeFlags } from './store.flags';

export const allFlags = {
    ...exampleFlags,
    ...paymentsFlags,
    ...productsFlags,
    ...storeFlags,
};
