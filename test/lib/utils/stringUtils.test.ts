/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { strict as assert } from 'assert';
import { convertKabobToCamel, convertToCamelKabob } from '../../../src/lib/utils/stringUtils';

describe('String Utils', () => {
    it('should convert test-name to testName', async () => {
        assert.equal(convertKabobToCamel('test-name'), 'testName');
    });
    it('should convert testName to test-name', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        assert.equal(convertToCamelKabob('testName'), 'test-name');
    });
});
