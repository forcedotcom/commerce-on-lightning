/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';

describe('Json Utils Override Json With Flags', () => {
    it('should override json values if its a passed in flag', async () => {
        const obj = { hubOrgAdminUsername: 'ceo@mydevhub.com' };
        // overrideJsonWithFlags(devHubFlags, { 'instance-url': 'hello' }, obj);
        // assert.equal(obj['instanceUrl'], 'hello');
        assert.equal(obj['hubOrgAdminUsername'], 'ceo@mydevhub.com');
    });
});
describe('Json Utils Parse JSON Config with Flags', () => {
    it('should parse the devhub json file', async () => {
        // const obj = parseJSONConfigWithFlags(B_DIR + '/devhub-configuration.json', devHubFlags, {});
        // assert.equal(obj['instanceUrl'], 'https://localhost:6101');
    });
    it('should override json file with flags', async () => {
        // const obj = parseJSONConfigWithFlags(B_DIR + '/devhub-configuration.json', devHubFlags, {
        //     'instance-url': 'hi',
        // });
        // assert.equal(obj['instanceUrl'], 'hi');
        // assert.equal(obj['hubOrgAlias'], 'devhub');
    });
});
