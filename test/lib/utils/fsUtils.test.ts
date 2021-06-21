/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { cleanName } from '../../../src/lib/utils/fsUtils';

describe('fsUtils clean name', () => {
    it('should turn @ into AT and . into DOT', async () => {
        assert.equal(cleanName('a@hi.com'), 'aAThiDOTcom');
    });
});
