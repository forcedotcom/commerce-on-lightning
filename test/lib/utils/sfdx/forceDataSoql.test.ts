/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import sinon, { stub } from 'sinon';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import * as shellExports from '../../../../src/lib/utils/shell';
import { Result } from '../../../../src/lib/utils/jsonUtils';
import { forceDataSoql } from '../../../../src/lib/utils/sfdx/forceDataSoql';

describe('forceDataSoql forceDataSoql', () => {
    it('should get query results', async () => {
        const res = new Result<QueryResult>();
        res.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [];
            public totalSize: number;
        })();
        res.result.records.push({ Id: 'b', Name: 'a', attributes: { type: 'test', url: 'someurl' } });
        const s = stub(shellExports, 'shellJsonSfdx').returns(res);
        assert.equal(forceDataSoql('a').result.records[0].attributes['type'], 'test');
        s.restore();
    });
    afterEach(() => {
        sinon.restore();
    });
});
