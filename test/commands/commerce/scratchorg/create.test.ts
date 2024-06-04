/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import sinon, { stub } from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { IConfig } from '@oclif/config';
import { $$ } from '@salesforce/command/lib/test';
import { UX } from '@salesforce/command';
import { StatusFileManager } from '../../../../src/lib/utils/statusFileManager';
import { ScratchOrgCreate } from '../../../../src/commands/commerce/scratchorg/create';
import { Result } from '../../../../src/lib/utils/jsonUtils';
import * as shellExports from '../../../../src/lib/utils/shell';
import { CONFIG_DIR } from '../../../../src/lib/utils/constants/properties';
import * as flagHelpers from '../../../../src/lib/utils/args/flagsUtils';

describe('commerce:scratchorg:create', () => {
    afterEach(() => {
        sinon.restore();
    });
    it('should create a scratch org', async () => {
        const config = stubInterface<IConfig>($$.SANDBOX, {});
        const devhubUser = 'test_devhub@1commerce.com';
        const orgUser = 'test_org@1commerce.com';
        const sfm = new StatusFileManager(devhubUser, orgUser);
        const setScratchOrgValueStub = stub(sfm, 'setScratchOrgValue').resolves();
        const getScratchOrgValueStub = stub(sfm, 'getScratchOrgValue').resolves();

        const scratchOrgCreate = new ScratchOrgCreate([], config);
        scratchOrgCreate.devhubUsername = devhubUser;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scratchOrgCreate.ux = stubInterface<UX>($$.SANDBOX);
        scratchOrgCreate.statusManager = sfm;

        const flagObject = {
            username: orgUser,
            type: 'b2c',
            apiversion: '52.0',
            alias: 'a',
            wait: 5,
            duration: 15,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scratchOrgCreate.flags = Object.assign({}, flagObject);

        const res = new Result();
        res.result = { id: 'hi', username: 'bye' };
        const shellStub = stub(shellExports, 'shellJsonSfdx').returns(res);

        const cmd = `sf org create scratch \
        --target-dev-hub="${devhubUser}" \
        --definition-file=${CONFIG_DIR}/${flagObject.type}-project-scratch-def.json \
        --api-version="${flagObject.apiversion}" \
        --alias="${flagObject.alias}" \
        --duration-days=${flagObject.duration} \
        --wait=${flagObject.wait} \
        --targetusername="${flagObject.username}" \
        --set-default \
        --json`;
        const flagHelperStub = stub(flagHelpers, 'appendCommonFlags').returns(cmd);

        await scratchOrgCreate.createScratchOrg();

        assert.equal(shellStub.calledWith(cmd, null, '/tmp'), true);
        [setScratchOrgValueStub, getScratchOrgValueStub, shellStub, flagHelperStub].forEach((k) => k.restore());
    });
});
