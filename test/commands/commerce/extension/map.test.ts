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
import { MapExtension } from '../../../../src/commands/commerce/extension/map';
import { Result } from '../../../../src/lib/utils/jsonUtils';

describe('Test extension map command', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    const registeredExtensionName = 'testRegExtension';
    const storeName = 'testStore';
    const storeId = 'testId';
    const orgUserName = 'testUserName';
    const service = 'StoreIntegratedService';
    const registeredExternalServiceId = 'testServiceId';
    // const epn = 'testepn';
    const QUERY_GET_WEBSTORE = `SELECT Id FROM WebStore WHERE Name='${storeName}' LIMIT 1`;
    const QUERY_GET_WEBSTORE_ID = `SELECT Id FROM WebStore WHERE Id='${storeId}' LIMIT 1`;
    const QUERY_GET_INSERTED_RECORD = `SELECT Id,Integration,ServiceProviderType,StoreId from StoreIntegratedService WHERE StoreId= '${storeId}' and Integration='${registeredExternalServiceId}' limit 1`;
    // const QUERY_GET_REGISTRATION = `SELECT Id FROM RegisteredExternalService WHERE DeveloperName='${registeredExtensionName}'`;
    const INSERT_RECORD = `Integration=${service} StoreId=${storeId} ServiceProviderType='Extension'`;
    const mapCommand = new MapExtension([], config);
    const sfdxError = new SfdxError('error');

    after(() => {
        sinon.restore();
    });
    it('Throws error with a invalid Webstore Name', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        forceDataSoqlStub.withArgs(QUERY_GET_WEBSTORE, orgUserName).throws(new SfdxError('Invalid Webstore'));
        assert.throws(
            () => mapCommand.processMapExtension(registeredExtensionName, storeName, undefined, orgUserName),
            SfdxError
        );
        forceDataSoqlStub.restore();
    });
    it('Throws error with a invalid Webstore Id', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        forceDataSoqlStub.withArgs(QUERY_GET_WEBSTORE_ID, orgUserName).throws(new SfdxError('Invalid Store Id'));
        assert.throws(
            () => mapCommand.processMapExtension(registeredExtensionName, storeName, storeId, orgUserName),
            SfdxError
        );
        forceDataSoqlStub.restore();
    });
    it('Successful extension mapping', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_WEBSTORE, 'testUserName').returns(qr);
        // stub EPN query call with size 1 to let it flow through the code
        const idQr = new Result<QueryResult>();
        idQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'hey' }];
            public totalSize = 1;
        })();
        const forceDataRecordStub = sinon.stub(forceOrgSoqlExports, 'forceDataRecordCreate');
        forceDataRecordStub.withArgs(service, INSERT_RECORD, 'testUserName').returns(sfdxError);
        const jsonqr = new Result<QueryResult>();
        jsonqr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_INSERTED_RECORD, 'testUserName').returns(jsonqr);
        assert.throws(
            () => mapCommand.processMapExtension(registeredExtensionName, storeName, undefined, orgUserName),
            SfdxError
        );

        forceDataSoqlStub.restore();
    });
});
