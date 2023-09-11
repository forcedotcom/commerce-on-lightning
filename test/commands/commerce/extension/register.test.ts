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
import { test, expect } from '@oclif/test';
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
    const QUERY_GET_APEX_CLASS = `SELECT Id FROM ApexClass WHERE Name='${apexClass}' LIMIT 1`;
    const QUERY_GET_EPN_LIST = `SELECT Value FROM PicklistValueInfo WHERE Value='${epn}' AND EntityParticle.DurableId = 'RegisteredExternalService.ExtensionPointName' LIMIT 1`;
    const QUERY_GET_INSERTED_RECORD = `DeveloperName=${registeredExtensionName} MasterLabel=${registeredExtensionName} ExtensionPointName=${epn} ExternalServiceProviderId=${apexClassId} ExternalServiceProviderType='Extension'`;
    const QUERY_REGISTER_TABLE = `SELECT FIELDS(ALL) from RegisteredExternalService WHERE DeveloperName='${registeredExtensionName}' LIMIT 1`;
    const registerExtension = new RegisterExtension([], config);
    const sfdxError = new SfdxError('error');
    const logger = sinon.match.any;
    const defaultArgs = sinon.match.any;

    after(() => {
        sinon.restore();
    });

    it('Throws error with a invalid Apex class', async () => {
        const forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
        forceDataSoqlStub
            .withArgs(QUERY_GET_APEX_CLASS, orgUserName, defaultArgs, logger)
            .throws(new SfdxError('Invalid Apex'));
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
        forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, 'testUserName', sinon.match.any, sinon.match.any).returns(qr);
        // stub EPN query call
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [];
            public totalSize = 0;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_EPN_LIST, orgUserName, defaultArgs, logger).returns(epnQr);
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
        forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, 'testUserName', defaultArgs, logger).returns(qr);
        // stub EPN query call with size 1 to let it flow through the code
        const epnQr = new Result<QueryResult>();
        epnQr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'bye' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_GET_EPN_LIST, 'testUserName', defaultArgs, logger).returns(epnQr);
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
        forceDataRecordStub
            .withArgs(service, QUERY_GET_INSERTED_RECORD, 'testUserName', defaultArgs, logger)
            .returns(sfdxError);
        const jsonqr = new Result<QueryResult>();
        jsonqr.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Id: 'hi' }];
            public totalSize = 1;
        })();
        forceDataSoqlStub.withArgs(QUERY_REGISTER_TABLE, 'testUserName', defaultArgs, logger).returns(jsonqr);
        assert.throws(
            () => registerExtension.registerApex(registeredExtensionName, epn, apexClass, orgUserName),
            TypeError
        );
        assert(forceDataSoqlStub.calledWith(QUERY_GET_APEX_CLASS, orgUserName));
        assert(forceDataSoqlStub.calledWith(QUERY_GET_EPN_LIST));
        forceDataSoqlStub.restore();
        forceDataRecordStub.restore();
    });

    describe('commerce:extension:register backwards compatibility', () => {
        const command = [
            'commerce:extension:register',
            '-u',
            orgUserName,
            '-r',
            registeredExtensionName,
            '-e',
            epn,
            '-a',
            apexClass,
            '-d',
            'This is a test I am making',
            '--icon-uri',
            '/static/icon.png',
            '--is-application',
        ];

        const commandVersion59: string[] = Array.from(command);
        commandVersion59.push('--apiversion', '59.0');

        const commandOldVersion: string[] = Array.from(command);
        commandOldVersion.push('--apiversion', '57.0');

        let forceDataSoqlStub: sinon.SinonStub;
        let forceDataRecordStub: sinon.SinonStub;

        // Mocking the database calls before each function.
        beforeEach(() => {
            forceDataSoqlStub = sinon.stub(forceOrgSoqlExports, 'forceDataSoql');
            forceDataRecordStub = sinon.stub(forceOrgSoqlExports, 'forceDataRecordCreate');
            const qr = new Result<QueryResult>();
            qr.result = new (class implements QueryResult {
                public done: boolean;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                public records: Record[] = [{ ApexClassName: 'CartSummaryExtension' }];
                public totalSize = 1;
            })();
            forceDataSoqlStub.withArgs(QUERY_GET_APEX_CLASS, 'testUserName', defaultArgs, logger).returns(qr);

            // stub EPN query call with size 1 to let it flow through the code
            const epnQr = new Result<QueryResult>();
            epnQr.result = new (class implements QueryResult {
                public done: boolean;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                public records: Record[] = [{ Value: 'bye' }];
                public totalSize = 1;
            })();
            forceDataSoqlStub.withArgs(QUERY_GET_EPN_LIST, 'testUserName', defaultArgs, logger).returns(epnQr);
            // // stub insert record call
            const recordQr = new Result<QueryResult>();
            recordQr.result = new (class implements QueryResult {
                public done: boolean;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                public records: Record[] = [{ Value: 'epn' }];
                public totalSize = 1;
            })();

            forceDataRecordStub
                .withArgs(service, QUERY_GET_INSERTED_RECORD, 'testUserName', defaultArgs, logger)
                .returns({});
            const jsonqr = new Result<QueryResult>();
            jsonqr.result = new (class implements QueryResult {
                public done: boolean;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                public records: Record[] = [{ Id: 'hi' }];
                public totalSize = 1;
            })();
            forceDataSoqlStub.withArgs(QUERY_REGISTER_TABLE, 'testUserName', defaultArgs, logger).returns(jsonqr);
        });

        afterEach(() => {
            forceDataSoqlStub.restore();
            forceDataRecordStub.restore();
        });

        after(() => {
            sinon.restore();
        });

        test.stdout()
            .command(commandVersion59)
            .it('Description, icon-uri, and isApplication works with API', () => {
                expect(
                    forceDataRecordStub.calledWith(
                        sinon.match.string,
                        sinon.match('Description') && sinon.match('IconURI') && sinon.match('isApplication')
                    )
                );
            });
    });
});
