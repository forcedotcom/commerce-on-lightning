/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import sinon, { stub } from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { IConfig } from '@oclif/config';
import { $$ } from '@salesforce/command/lib/test';
import { UX } from '@salesforce/command';
import { Org } from '@salesforce/core';
import * as forceOrgSoqlExports from '../../../../../src/lib/utils/sfdx/forceDataSoql';
import { Result } from '../../../../../src/lib/utils/jsonUtils';
import { StatusFileManager } from '../../../../../src/lib/utils/statusFileManager';
import { StoreCreate } from '../../../../../src/commands/commerce/store/create';
import { UserInfo } from '../../../../../src/lib/utils/jsonUtils';
import { StoreDisplay } from '../../../../../src/commands/commerce/store/display';

describe('commerce:store:display', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    afterEach(() => {
        sinon.restore();
    });
    it('should get full store url using getFullStoreURL', async () => {
        const sfm = new StatusFileManager('a', 'b', 'c');
        const d = stub(sfm, 'setValue').resolves();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const c = stub(sfm, 'getValue').resolves();
        const c1 = stub(StoreCreate, 'getUserInfo').resolves(
            new UserInfo('https://dayna-lwc-2815-dev-ed.my.localhost.sfdcdev.salesforce.com:6101')
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        const qr = new Result<QueryResult>();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Domain: { Domain: 'hello' } }];
            public totalSize: number;
        })();
        const c2 = stub(forceOrgSoqlExports, 'forceDataSoql').returns(qr);
        // const org = stub(Org.prototype, 'getUsername').returns('test');
        const org = await Org.create({ aliasOrUsername: 'foo@example.com' });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
        const storeViewInfo = new StoreDisplay([], config);
        storeViewInfo.org = org;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore because protected member
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        storeViewInfo.ux = stubInterface<UX>($$.SANDBOX);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        storeViewInfo.statusFileManager = sfm;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore because protected member
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        storeViewInfo.flags = Object.assign({}, { 'store-name': 'test' });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        assert.equal(await storeViewInfo.getFullStoreURL(), 'https://hello:6101/test');
        [c, c1, c2, d].forEach((k) => k.restore());
    });
});
