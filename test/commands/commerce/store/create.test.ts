/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import sinon, { stub } from 'sinon';
import { StubbedType } from '@salesforce/ts-sinon';
import { UX } from '@salesforce/command';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { Requires } from '../../../../src/lib/utils/requires';
import * as sleepExports from '../../../../src/lib/utils/sleep';
import * as shellExports from '../../../../src/lib/utils/shell';
import * as forceOrgSoqlExports from '../../../../src/lib/utils/sfdx/forceDataSoql';
import { DevHubConfig, Result } from '../../../../src/lib/utils/jsonUtils';
import { statusManager } from '../../../../src/lib/utils/statusFileManager';
import { StoreCreate } from '../../../../src/commands/commerce/store/create';

describe('commerce:store:create', () => {
    let uxStub: StubbedType<UX>;
    afterEach(() => {
        sinon.restore();
    });
    it('should get storeId using statusManager', async () => {
        const s = stub(statusManager, 'setValue').resolves();
        const d = stub(Requires, 'default').returns(new Requires());
        const c = stub(statusManager, 'getValue').resolves('hi');
        assert.equal(await StoreCreate.getStoreId(new DevHubConfig(), UX), 'hi');
        [c, d, s].forEach((a) => a.restore());
    });
    it('should get storeid using getStoreId', async () => {
        const s = stub(statusManager, 'setValue').resolves();
        const d = stub(Requires, 'default').returns(new Requires());
        const c = stub(statusManager, 'getValue').resolves(undefined);
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize: number;
        })();
        const c1 = stub(forceOrgSoqlExports, 'forceDataSoql').returns(qr);
        assert.equal(await StoreCreate.getStoreId(new DevHubConfig(), uxStub), 'hi');
        [c, c1, d, s].forEach((a) => a.restore());
    });
    it('should wait for storeid using waitForStoreId', async () => {
        const s = stub(statusManager, 'setValue').resolves();
        const d = stub(Requires, 'default').returns(new Requires());
        const c = stub(StoreCreate, 'getStoreId').resolves('hi');
        const c1 = stub(sleepExports, 'sleep').resolves(); // don't sleep
        assert.doesNotThrow(async () => await StoreCreate.waitForStoreId(new DevHubConfig(), uxStub, 0));
        [c, c1, s, d].forEach((a) => a.restore());
    });
    it('should get user info using getUserInfo', async () => {
        const s = stub(statusManager, 'setValue').resolves();
        const d = stub(Requires, 'default').returns(new Requires());
        const c = stub(statusManager, 'getValue').resolves(undefined);
        const res = new Result();
        res.result = { id: 'hi', username: 'bye' };
        const c1 = stub(shellExports, 'shellJsonSfdx').returns(res);
        assert.equal((await StoreCreate.getUserInfo(new DevHubConfig())).username, 'bye');
        [c, c1, d, s].forEach((a) => a.restore());
    });
});
