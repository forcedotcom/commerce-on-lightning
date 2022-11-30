/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { strict as assert } from 'assert';
import { stubInterface } from '@salesforce/ts-sinon';
import { IConfig } from '@oclif/config';
import { $$ } from '@salesforce/command/lib/test';
import sinon from 'sinon';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { getEPN } from '../../../../../src/commands/commerce/extension/points/list';
import * as forceOrgSoqlExports from '../../../../../src/lib/utils/sfdx/forceDataSoql';
import { Result } from '../../../../../src/lib/utils/jsonUtils';

describe('Test EPN list command', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    const QUERY_GET_EPN =
        "SELECT Value, IsDefaultValue, IsActive FROM PicklistValueInfo WHERE EntityParticle.DurableId = 'RegisteredExternalService.ExtensionPointName'";
    const epnList = new getEPN([], config);
    const logger = sinon.match.any;
    const defaultArgs = sinon.match.any;
    after(() => {
        sinon.restore();
    });

    it('test #1', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        // stub EPN query call with a record
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_EPN, '', defaultArgs, logger).returns(epnQr);
        assert.throws(() => epnList.printEPN(), TypeError);
        // assert(forceDataSoqlStub.calledWith(QUERY_GET_EPN));
        forceDataSoqlStub.restore();
    });
    it('test #2', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        // stub EPN query call with no records
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [];
            public totalSize = 0;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_EPN, '', defaultArgs, logger).returns(epnQr);
        assert.throws(() => epnList.printEPN(), TypeError);
        // assert(forceDataSoqlStub.calledWith(QUERY_GET_EPN));
        forceDataSoqlStub.restore();
    });
});
