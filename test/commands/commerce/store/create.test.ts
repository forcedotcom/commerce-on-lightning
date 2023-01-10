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
import { Logger } from '@salesforce/core';
import * as sleepExports from '../../../../src/lib/utils/sleep';
import * as shellExports from '../../../../src/lib/utils/shell';
import * as forceOrgSoqlExports from '../../../../src/lib/utils/sfdx/forceDataSoql';
import { Result } from '../../../../src/lib/utils/jsonUtils';
import { StatusFileManager } from '../../../../src/lib/utils/statusFileManager';
import { StoreCreate } from '../../../../src/commands/commerce/store/create';

describe('commerce:store:create', () => {
    let uxStub: StubbedType<UX>;
    const logger = new Logger('test');
    let loggerStub: sinon.SinonStub;
    const defaultFlags = {};
    after(() => {
        sinon.restore();
    });
    beforeEach(() => {
        loggerStub = sinon.stub(logger, 'debug').returns(logger);
    });
    afterEach(() => {
        loggerStub.restore();
    });
    it('should get storeId using statusManager', async () => {
        const sfm = new StatusFileManager('a', 'b', 'c');
        const s = stub(sfm, 'setValue').resolves();
        const c = stub(sfm, 'getValue').resolves('hi');
        assert.equal(await StoreCreate.getStoreId(sfm, defaultFlags, UX, logger), 'hi');
        [c, s].forEach((a) => a.restore());
    });
    it('should get storeid using getStoreId', async () => {
        const sfm = new StatusFileManager('a', 'b', 'c');
        const s = stub(sfm, 'setValue').resolves();
        const c = stub(sfm, 'getValue').resolves(undefined);
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize: number;
        })();
        const c1 = stub(forceOrgSoqlExports, 'forceDataSoql').returns(qr);
        assert.equal(await StoreCreate.getStoreId(sfm, defaultFlags, uxStub, logger), 'hi');
        [c, c1, s].forEach((a) => a.restore());
    });
    it('should wait for storeid using waitForStoreId', async () => {
        const sfm = new StatusFileManager('a', 'b', 'c');
        const s = stub(sfm, 'setValue').resolves();
        // const c = stub(sfm, 'getValue').resolves('hi');
        const c = stub(StoreCreate, 'getStoreId').resolves('hi');
        const c1 = stub(sleepExports, 'sleep').resolves(); // don't sleep
        assert.doesNotThrow(async () => await StoreCreate.waitForStoreId(sfm, defaultFlags, uxStub, logger, 0));
        [c, c1, s].forEach((a) => a.restore());
    });
    it('should get user info using getUserInfo', async () => {
        const sfm = new StatusFileManager('a', 'b', 'c');
        const s = stub(sfm, 'setValue').resolves();
        const c = stub(sfm, 'getValue').resolves(undefined);
        const res = new Result();
        res.result = { id: 'hi', username: 'bye' };
        const c1 = stub(shellExports, 'shellJsonSfdx').returns(res);
        assert.equal((await StoreCreate.getUserInfo(sfm, 'test', defaultFlags, logger)).username, 'bye');
        [c, c1, s].forEach((a) => a.restore());
    });
});
