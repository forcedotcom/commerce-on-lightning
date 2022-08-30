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
import { SfdxError } from '@salesforce/core';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import * as forceOrgSoqlExports from '../../../../src/lib/utils/sfdx/forceDataSoql';
import { UnMapExtension } from '../../../../src/commands/commerce/extension/unmap';
import { Result } from '../../../../src/lib/utils/jsonUtils';

describe('Test extension unmap command', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    const registeredExtensionName = 'testRegExtension';
    const storeName = 'testStore';
    const storeId = 'testId';
    const orgUserName = 'testUserName';
    const QUERY_GET_WEBSTORE = `SELECT Id FROM WebStore WHERE Name='${storeName}' LIMIT 1`;
    const QUERY_GET_WEBSTORE_ID = `SELECT Id FROM WebStore WHERE Id='${storeId}' LIMIT 1`;
    const QUERY_GET_STORENAME = `SELECT Name FROM WebStore WHERE Id='${storeId}' LIMIT 1`;
    const integration = 'integration';
    const service = 'StoreIntegratedService';
    const DELETE_RECORD = `SELECT Id FROM StoreIntegratedService WHERE Integration='${integration}' AND storeid='${storeId}'`;
    const unmapCommand = new UnMapExtension([], config);
    // const sfdxError = new SfdxError('error');

    after(() => {
        sinon.restore();
    });
    it('Throws error with a invalid Webstore Name', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        forceDataSoqlStub.withArgs(QUERY_GET_WEBSTORE, orgUserName).throws(new TypeError('Invalid Webstore'));
        assert.throws(
            () => unmapCommand.unmapRecord(registeredExtensionName, storeName, undefined, orgUserName),
            TypeError
        );
        forceDataSoqlStub.restore();
    });
    it('Throws error with a invalid Webstore Id', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        forceDataSoqlStub.withArgs(QUERY_GET_WEBSTORE_ID, orgUserName).throws(new SfdxError('Invalid Store Id'));
        assert.throws(
            () => unmapCommand.unmapRecord(registeredExtensionName, storeName, storeId, orgUserName),
            SfdxError
        );
        forceDataSoqlStub.restore();
    });
    it('Throws error with deleting a record', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_WEBSTORE_ID, 'testUserName').returns(qr);
        // stub EPN query call with size 1 to let it flow through the code
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'bye' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_STORENAME, 'testUserName').returns(epnQr);
        // // stub insert record call
        const recordQr = new Result<QueryResult>();
        recordQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [];
            public totalSize = 1;
        })();
        const forceDataRecordStub = sinon.stub(forceOrgSoqlExports, 'forceDataRecordDelete');
        forceDataRecordStub.withArgs(service, DELETE_RECORD, 'testUserName');
        assert.throws(
            () => unmapCommand.unmapRecord(registeredExtensionName, storeName, storeId, orgUserName),
            TypeError
        );
        assert(forceDataSoqlStub.calledWith(QUERY_GET_WEBSTORE_ID, orgUserName));
        forceDataSoqlStub.restore();
    });
    it('Successful Unmapping', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_WEBSTORE_ID, 'testUserName').returns(qr);
        // stub EPN query call with size 1 to let it flow through the code
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'bye' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_STORENAME, 'testUserName').returns(epnQr);
        // // stub insert record call
        const recordQr = new Result<QueryResult>();
        recordQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [];
            public totalSize = 0;
        })();
        forceDataSoqlStub.restore();
    });
});
