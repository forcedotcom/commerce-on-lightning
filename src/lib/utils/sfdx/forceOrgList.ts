/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { shellJsonSfdx } from '../shell';
import { Org, OrgListResult, Result } from '../jsonUtils';

export const forceOrgList = (): Result<OrgListResult> => shellJsonSfdx('sf org list --json');
const getOrg = (resultType: string, by: string, value: string): Org => {
    let orgInfo: Result<OrgListResult>;
    try {
        orgInfo = forceOrgList();
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        if (e.message.indexOf('noOrgsFound') < 0) throw e;
        return null;
    }
    if (orgInfo.status === 0 && orgInfo.result[resultType])
        for (const result of resultType === 'nonScratchOrgs'
            ? orgInfo.result.nonScratchOrgs
            : orgInfo.result.scratchOrgs)
            if (result[by] && result[by] === value) return result;
    return null;
};
// might be better/quicker to get it from ~/.sfdx/huborgusername.json
export const getHubOrgByUsername = (username: string): Org => getOrg('nonScratchOrgs', 'username', username);
export const getScratchOrgByUsername = (username: string): Org => getOrg('scratchOrgs', 'username', username);
