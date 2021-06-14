/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import sinon, { stub } from 'sinon';
import * as forceOrgListExports from '../../../../src/lib/utils/sfdx/forceOrgList';
import { Org, OrgListResult, Result } from '../../../../src/lib/utils/jsonUtils';
import { getHubOrgByUsername } from '../../../../src/lib/utils/sfdx/forceOrgList';

describe('forceOrgList getHubOrgByUsername', () => {
    it('should get hub org by username', async () => {
        const res = new Result<OrgListResult>();
        res.status = 0;
        res.result = new OrgListResult();
        res.result.nonScratchOrgs.push(new Org('a'));
        res.result.nonScratchOrgs.push(new Org('b'));
        const s = stub(forceOrgListExports, 'forceOrgList').returns(res);
        assert.equal(getHubOrgByUsername('a').username, 'a');
        s.restore();
    });
    afterEach(() => {
        sinon.restore();
    });
});
