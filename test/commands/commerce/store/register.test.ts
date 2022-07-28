/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// import { strict as assert } from 'assert';
// import sinon, { stub } from 'sinon';
// import { StubbedType } from '@salesforce/ts-sinon';
// import { UX } from '@salesforce/command';
// import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
// import { expect, test } from '@salesforce/command/lib/test';
// import { Org, OrgListResult, Result } from '../../../../src/lib/utils/jsonUtils';
// import { StatusFileManager } from '../../../../src/lib/utils/statusFileManager';
// // import { RegisterExtension } from '../../../../src/commands/commerce/extension/register';
// import * as shellExports from '../../../../src/lib/utils/shell';
// import { StoreCreate } from '../../../../src/commands/commerce/store/create';
// import { getHubOrgByUsername } from '../../../../src/lib/utils/sfdx/forceOrgList';
// import * as forceOrgListExports from '../../../../src/lib/utils/sfdx/forceOrgList';

import { strict as assert } from 'assert';
import { stubInterface } from '@salesforce/ts-sinon';
import { IConfig } from '@oclif/config';
import { $$ } from '@salesforce/command/lib/test';
import sinon from 'sinon';
import { SfdxError } from '@salesforce/core';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { RegisterExtension } from '../../../../src/commands/commerce/extension/register';
import * as forceOrgSoqlExports from '../../../../src/lib/utils/sfdx/forceDataSoql';
import { Result } from '../../../../src/lib/utils/jsonUtils';

describe('Test extension register function', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    const registeredExtensionName = 'test';
    const epn = 'testEPN';
    const apexClass = 'testApex';
    const orgUserName = 'testUser';
    const QUERY_GET_APEX_CLASS = `SELECT Id FROM ApexClass WHERE Name='${apexClass}' LIMIT 1`;
    const QUERY_GET_EPN_LIST = `SELECT Value FROM PicklistValueInfo WHERE Value='${epn}' AND EntityParticle.DurableId = 'RegisteredExternalService.ExtensionPointName' LIMIT 1`;

    const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
    const registerExtension = new RegisterExtension([], config);

    beforeEach(() => {
        forceDataSoqlStub.reset();
    });

    after(() => {
        sinon.restore();
    });

    it('Throws error with a invalid Apex class', async () => {
        forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, orgUserName).throws(new SfdxError('Invalid Apex'));
        assert.throws(
            () => registerExtension.registerApex(registeredExtensionName, epn, apexClass, orgUserName),
            SfdxError
        );
        assert(forceDataSoqlStub.calledWith(QUERY_GET_APEX_CLASS, orgUserName));
    });
    it('Throws error with a invalid EPN', async () => {
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, 'testUser').returns(qr);
        // stub EPN query call
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [];
            public totalSize = 0;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_EPN_LIST).returns(epnQr);
        assert.throws(
            () => registerExtension.registerApex(registeredExtensionName, epn, apexClass, orgUserName),
            SfdxError
        );
        assert(forceDataSoqlStub.calledWith(QUERY_GET_APEX_CLASS, orgUserName));
        assert(forceDataSoqlStub.calledWith(QUERY_GET_EPN_LIST));
    });
});

//     // get storeid using create command's method
//     it('should get the storeid using getStoreId()', async () => {
//         const sfm = new StatusFileManager('a', 'b', 'c');
//         const s = stub(sfm, 'setValue').resolves();
//         const c = stub(sfm, 'getValue').resolves(undefined);
//         const qr = new Result<QueryResult>();
//         qr.result = new (class implements QueryResult {
//             public done: boolean;
//             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//             // @ts-ignore
//             public records: Record[] = [{ Id: 'hi' }];
//             public totalSize: number;
//         })();
//         const c1 = stub(forceOrgSoqlExports, 'forceDataSoql').returns(qr);
//         assert.equal(await StoreCreate.getStoreId(sfm, uxStub), 'hi');
//         [c, c1, s].forEach((a) => a.restore());
//     });
//     // // get userinfo using create command's method "getUserInfo())"
//     it('should get the users info using getUserInfo()', async () => {
//         const sfm = new StatusFileManager('a', 'b', 'c');
//         const s = stub(sfm, 'setValue').resolves();
//         const c = stub(sfm, 'getValue').resolves(undefined);
//         const res = new Result();
//         res.result = { id: 'testId', username: 'testUser' };
//         const c1 = stub(shellExports, 'shellJsonSfdx').returns(res);
//         assert.equal((await StoreCreate.getUserInfo(sfm, 'test')).username, 'testUser');
//         [c, c1, s].forEach((a) => a.restore());
//     });
// });

// describe('Test for invalid apex class', () => {
//     test.stdout()
//         .stderr()
//         // .stub(forceOrgSoqlExports, 'forceDataSoql', async () => {
//         //     throw new Error('hello');
//         // })
//         .withOrg({ username: 'demo_u4@1commerce.com' }, true)
//         .timeout(600000)
//         .command(['commerce:extension:register', '-a', 'TestApex1', '-e', 'CommerceDx_Inventory', '-r', 'test25'])
//         .it('runs commerce:extension:register', (ctx) => {
//             expect(ctx.stderr).to.contain('Invalid class.');
//         });
// });
// describe('Test for Invalid EPN', () => {
//     test.stdout()
//         .stderr()
//         .withOrg({ username: 'demo_u4@1commerce.com' }, true)
//         .timeout(600000)
//         .command([
//             'commerce:extension:register',
//             '-a',
//             'TestApex',
//             '-e',
//             'CommerceDx_Inventory_TestFailed',
//             '-r',
//             'test25',
//         ])
//         .it('runs commerce:extension:register', (ctx) => {
//             expect(ctx.stderr).to.contain('Invalid EPN');
//         });
// });
// describe('Test successful register', () => {
//     test.stdout()
//         .stderr()
//         .withOrg({ username: 'demo_u4@1commerce.com' }, true)
//         .timeout(600000)
//         .command(['commerce:extension:register', '-a', 'TestApex', '-e', 'CommerceDx_Inventory', '-r', 'test102'])
//         .it('runs commerce:extension:register', (ctx) => {
//             expect(ctx.stdout).to.contain('Sucessfully registered Apex Class');
//         });
// });
// describe('Test existing RegisterExtensionName', () => {
//     test.stdout()
//         .stderr()
//         .withOrg({ username: 'demo_u4@1commerce.com' }, true)
//         .timeout(600000)
//         .command(['commerce:extension:register', '-a', 'TestApex', '-e', 'CommerceDx_Inventory', '-r', 'test25'])
//         .it('runs commerce:extension:register', (ctx) => {
//             expect(ctx.stderr).to.contain('Registered-Extension name already');
//         });
// });
