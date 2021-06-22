/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { addAllowedArgs } from '../../../../src/lib/utils/args/flagsUtils';
import { StoreCreate } from '../../../../src/commands/commerce/store/create';

describe('flagsUtils add allowed args', () => {
    it('should add only args that the sfdxcommand Auth allows', async () => {
        const res = addAllowedArgs(['-c', 'hi', '-b', 'bye'], StoreCreate);
        // -c is not allowed but -b is so i don't expect -c or it's value to exist in assert
        assert.deepEqual(res, ['-b', 'bye']);
    });
});
