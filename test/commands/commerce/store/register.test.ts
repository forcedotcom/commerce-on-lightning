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
import { RegisterExtension } from '../../../../src/commands/commerce/extension/register';
import * as forceOrgSoqlExports from '../../../../src/lib/utils/sfdx/forceDataSoql';
import { Result } from '../../../../src/lib/utils/jsonUtils';

describe('Test extension register function', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    const registeredExtensionName = 'testRegExtension';
    const epn = 'testEPN';
    const apexClass = 'testApexClass';
    const apexClassId = 'testId';
    const orgUserName = 'testUserName';
    const service = 'RegisteredExternalService';
    // const QUERY_RECORDID = `SELECT Id FROM RegisteredExternalService WHERE DeveloperName='${registeredExtensionName}'`;
    const QUERY_GET_APEX_CLASS = `SELECT Id FROM ApexClass WHERE Name='${apexClass}' LIMIT 1`;
    const QUERY_GET_EPN_LIST = `SELECT Value FROM PicklistValueInfo WHERE Value='${epn}' AND EntityParticle.DurableId = 'RegisteredExternalService.ExtensionPointName' LIMIT 1`;
    const QUERY_GET_INSERTED_RECORD = `DeveloperName=${registeredExtensionName} MasterLabel=${registeredExtensionName} ExtensionPointName=${epn} ExternalServiceProviderId=${apexClassId} ExternalServiceProviderType='Extension'`;
    // const QUERY_REGISTER_TABLE = `SELECT ConfigUrl,DeveloperName,DocumentationUrl,ExtensionPointName,ExternalServiceProviderId,ExternalServiceProviderType,Language,MasterLabel,NamespacePrefix from RegisteredExternalService WHERE DeveloperName='${registeredExtensionName}'`;
    const registerExtension = new RegisterExtension([], config);
    const sfdxError = new SfdxError('error');

    after(() => {
        sinon.restore();
    });

    it('Throws error with a invalid Apex class', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, orgUserName).throws(new SfdxError('Invalid Apex'));
        assert.throws(
            () => registerExtension.registerApex(registeredExtensionName, epn, apexClass, orgUserName),
            SfdxError
        );
        assert(forceDataSoqlStub.calledWith(QUERY_GET_APEX_CLASS, orgUserName));
        forceDataSoqlStub.restore();
    });

    it('Throws error with a invalid EPN', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, 'testUserName').returns(qr);
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
        forceDataSoqlStub.restore();
    });
    it('Successful extension registration', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        const qr = new Result<QueryResult>();
        qr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, 'testUserName').returns(qr);
        // stub EPN query call
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'bye' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_EPN_LIST, 'testUserName').returns(epnQr);
        // // stub insert record call
        const recordQr = new Result<QueryResult>();
        recordQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [];
            public totalSize = 1;
        })();
        const forceDataRecordStub = sinon.stub(forceOrgSoqlExports, 'forceDataRecordCreate');
        forceDataRecordStub.withArgs(service, QUERY_GET_INSERTED_RECORD, 'testUserName').returns(sfdxError);
        const jsonqr = new Result<QueryResult>();
        jsonqr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub
            .withArgs(
                `SELECT Id,ConfigUrl,DeveloperName,DocumentationUrl,ExtensionPointName,ExternalServiceProviderId,ExternalServiceProviderType,Language,MasterLabel,NamespacePrefix from RegisteredExternalService WHERE DeveloperName='${registeredExtensionName}'`,
                'testUserName'
            )
            .returns(jsonqr);
        assert.throws(
            () => registerExtension.registerApex(registeredExtensionName, epn, apexClass, orgUserName),
            TypeError
        );
        assert(forceDataSoqlStub.calledWith(QUERY_GET_APEX_CLASS, orgUserName));
        assert(forceDataSoqlStub.calledWith(QUERY_GET_EPN_LIST));
        forceDataSoqlStub.restore();
    });
});
