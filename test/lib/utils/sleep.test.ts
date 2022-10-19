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
        const start = new Date().getTime();
        await sleep(10);
        const end = new Date().getTime();
        const sleepTime = end - start;
        // eslint-disable-next-line no-console
        console.log('sleep time: ', sleepTime);
        assert.equal(sleepTime < 40, true);
    });
});
