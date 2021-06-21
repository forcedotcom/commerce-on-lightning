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
import * as forceOrgSoqlExports from '../../../../../src/lib/utils/sfdx/forceDataSoql';
import { DevHubConfig, Result } from '../../../../../src/lib/utils/jsonUtils';
import { StatusFileManager } from '../../../../../src/lib/utils/statusFileManager';
import { StoreCreate } from '../../../../../src/commands/commerce/store/create';
import { UserInfo } from '../../../../../src/lib/utils/jsonUtils';
import { StoreViewInfo } from '../../../../../src/commands/commerce/store/view/info';

describe('commerce:store:view:info', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    afterEach(() => {
        sinon.restore();
    });
    it('should get full store url using getFullStoreURL', async () => {
        const d = stub(StatusFileManager.prototype, 'setValue').resolves();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const c = stub(StatusFileManager.prototype, 'getValue').resolves();
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        const dhc = new DevHubConfig();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        dhc.storeName = 'test';
        const storeViewInfo = new StoreViewInfo([], config);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore because protected member
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        storeViewInfo.ux = stubInterface<UX>($$.SANDBOX);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        storeViewInfo.devHubConfig = dhc;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore because protected member
        storeViewInfo.flags = Object.assign({}, { configuration: 'devhub-configuration.json' });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        assert.equal(await storeViewInfo.getFullStoreURL(), 'https://hello:6101/test/s');
        [c, c1, c2, d].forEach((k) => k.restore());
    });
});
