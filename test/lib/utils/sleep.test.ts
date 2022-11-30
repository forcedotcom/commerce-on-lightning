/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { sleep } from '../../../src/lib/utils/sleep';

describe('Sleep', () => {
    it('should sleep for 10 ms', async () => {
        const start = Date.now();
        await sleep(10);
        const end = Date.now();
        const sleepTime = end - start;
        assert.equal(sleepTime >= 10 && sleepTime < 35, true);
    });
});
