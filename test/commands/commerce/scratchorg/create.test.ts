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

describe('commerce:scratchorg:create', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    afterEach(() => {
        sinon.restore();
    });
    it('should create a scratch org', async () => {
        const devhubUser = 'test_devhub@1commerce.com';
        const orgUser = 'test_org@1commerce.com';
        const sfm = new StatusFileManager(devhubUser, orgUser);
        const stub1 = stub(sfm, 'setScratchOrgValue').resolves();
        const stub2 = stub(sfm, 'getScratchOrgValue').resolves();

        const scratchOrgCreate = new ScratchOrgCreate([], config);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scratchOrgCreate.ux = stubInterface<UX>($$.SANDBOX);
        scratchOrgCreate.statusManager = sfm;

        const flagObject = {
            username: orgUser,
            targetdevhubusername: devhubUser,
            type: 'b2c',
            apiversion: '52.0',
            alias: 'a',
            wait: 5,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scratchOrgCreate.flags = Object.assign({}, flagObject);

        const res = new Result();
        res.result = { id: 'hi', username: 'bye' };
        const stub3 = stub(shellExports, 'shellJsonSfdx').returns(res);
        await scratchOrgCreate.createScratchOrg();
        const cmd = `sfdx force:org:create \
--targetdevhubusername="${flagObject.targetdevhubusername}" \
--definitionfile=${CONFIG_DIR}/${flagObject.type}-project-scratch-def.json \
--apiversion="${flagObject.apiversion}" \
--setalias="${flagObject.alias}" \
--durationdays=30 \
--wait=${flagObject.wait} \
username="${flagObject.username}" \
--setdefaultusername \
--json`;

        assert.equal(stub3.calledWith(cmd, null, '/tmp'), true);
        [stub1, stub2, stub3].forEach((k) => k.restore());
    });
});
