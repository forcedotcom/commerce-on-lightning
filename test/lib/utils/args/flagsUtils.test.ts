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
    it('should add args that has long names', async () => {
        const res = addAllowedArgs(['--test-arg', 'hi', '--buyer-username', 'bye'], StoreCreate);
        assert.deepEqual(res, ['--buyer-username', 'bye']);
    });
    it('should add args that has long name and short names', async () => {
        const res = addAllowedArgs(['-n', 'hi', '--buyer-username', 'bye'], StoreCreate);
        assert.deepEqual(res, ['-n', 'hi', '--buyer-username', 'bye']);
    });
    it('should add args that has "=" in short name ', async () => {
        const res = addAllowedArgs(['-n=hi', '-b=bye'], StoreCreate);
        assert.deepEqual(res, ['-n', 'hi', '-b', 'bye']);
    });
    it('should add args that has "=" in long name', async () => {
        const res = addAllowedArgs(['--store-name=hi', '--buyer-username=bye'], StoreCreate);
        assert.deepEqual(res, ['--store-name', 'hi', '--buyer-username', 'bye']);
    });
    it('should add args that has "=" only in long name', async () => {
        const res = addAllowedArgs(['--store-name=hi', '-b', 'bye'], StoreCreate);
        assert.deepEqual(res, ['--store-name', 'hi', '-b', 'bye']);
    });
});
