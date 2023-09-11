/* eslint-disable */
/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { stubInterface } from '@salesforce/ts-sinon';
import { IConfig } from '@oclif/config';
import { $$ } from '@salesforce/command/lib/test';
import sinon, { stub } from 'sinon';
import { UX } from '@salesforce/command';
import { Logger, Org, SfdxError } from '@salesforce/core';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { OrderManagementQuickstartSetup } from '../../../../../src/commands/commerce/ordermanagement/quickstart/setup';
import * as shellExports from '../../../../../src/lib/utils/shell';
import { Result } from '../../../../../src/lib/utils/jsonUtils';
import { EXAMPLE_DIR } from '../../../../../src/lib/utils/constants/properties';
import { QUERY_LOCATION_TYPES } from '../../../../../src/commands/commerce/ordermanagement/quickstart/setup';
import { SObject } from 'jsforce';
import { Query } from 'jsforce/query';
import * as assert from 'assert';

describe('Test order management setup command', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    const logger = new Logger('test');
    const org = new Org({});
    const username = 'test@1commerce.com';
    const apiversion = '57.0';
    const orderManagementQuickstartSetup = Object.assign(new OrderManagementQuickstartSetup([], config), {
        org,
        ux: stubInterface<UX>($$.SANDBOX),
        logger,
        flags: { apiversion: apiversion },
    });

    const deployResult = {
        status: 0,
        name: '',
        message: '',
        exitCode: 0,
        commandName: '',
        stack: '',
        warnings: [],
        result: undefined,
        command: '',
        orgId: '',
    };

    after(() => {
        sinon.restore();
    });

    it('successfully sets up the order management', async () => {
        const shellStub = stub(shellExports, 'shellJsonSfdx');
        const usernameStub = stub(org, 'getUsername').returns(username);
        // @ts-ignore
        const connectionStub = stub(org, 'getConnection').returns({
            sobject<T = object>(): SObject<T> {
                // @ts-ignore
                return {
                    // @ts-ignore
                    create() {
                        return Promise.resolve({ success: true });
                    },
                    // @ts-ignore
                    select(): Query<Array<Partial<T>>> {
                        // @ts-ignore
                        return Promise.resolve([{ locationType: 'warehouse' }]);
                    },
                };
            },
        });

        const locationTypesCmd = `sfdx force:data:soql:query -u "${username}" -q "${QUERY_LOCATION_TYPES}" --apiversion=${apiversion}`;
        const deployCommand = `sfdx force:mdapi:deploy -u "${username}" -d ${EXAMPLE_DIR}/som/ -w 1 --apiversion=${apiversion}`;
        const deployActionsCommand = `sfdx force:mdapi:deploy -u "${username}" -d ${EXAMPLE_DIR}/som/actions/ -w 1 --apiversion=${apiversion}`;
        shellStub.withArgs(deployCommand).returns(deployResult);
        shellStub.withArgs(deployActionsCommand).returns(deployResult);
        const locationTypesResult = new Result<QueryResult>();
        locationTypesResult.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'warehouse' }];
            public totalSize = 1;
        })();
        shellStub.withArgs(locationTypesCmd).returns(locationTypesResult);
        await orderManagementQuickstartSetup.run();

        sinon.assert.calledThrice(shellStub);
        sinon.assert.calledWith(shellStub, deployCommand);
        sinon.assert.calledWith(shellStub, deployActionsCommand);
        sinon.assert.calledWith(shellStub, locationTypesCmd);

        [shellStub, usernameStub, connectionStub].forEach((stub) => stub.restore());
    });

    it('throws error when flows deployment fails', async () => {
        const shellStub = stub(shellExports, 'shellJsonSfdx');
        const usernameStub = stub(org, 'getUsername').returns(username);
        const deployCommand = `sfdx force:mdapi:deploy -u "${username}" -d ${EXAMPLE_DIR}/som/ -w 1 --apiversion=${apiversion}`;
        shellStub.withArgs(deployCommand).throws(new SfdxError('Test'));

        await assert.rejects(orderManagementQuickstartSetup.run());
        sinon.assert.calledOnce(shellStub);
        sinon.assert.calledWith(shellStub, deployCommand);

        [shellStub, usernameStub].forEach((stub) => stub.restore());
    });

    it('throws error when actions deployment fails', async () => {
        const shellStub = stub(shellExports, 'shellJsonSfdx');
        const usernameStub = stub(org, 'getUsername').returns(username);
        const deployCommand = `sfdx force:mdapi:deploy -u "${username}" -d ${EXAMPLE_DIR}/som/ -w 1 --apiversion=${apiversion}`;
        shellStub.withArgs(deployCommand).returns(deployResult);
        const deployActionsCommand = `sfdx force:mdapi:deploy -u "${username}" -d ${EXAMPLE_DIR}/som/actions/ -w 1 --apiversion=${apiversion}`;
        shellStub.withArgs(deployActionsCommand).throws(new SfdxError('Test'));
        await assert.rejects(orderManagementQuickstartSetup.run());
        sinon.assert.calledTwice(shellStub);
        sinon.assert.calledWith(shellStub, deployCommand);

        [shellStub, usernameStub].forEach((stub) => stub.restore());
    });

    it('throws error when location api fails', async () => {
        const shellStub = stub(shellExports, 'shellJsonSfdx');
        const usernameStub = stub(org, 'getUsername').returns(username);
        // @ts-ignore
        const connectionStub = stub(org, 'getConnection').returns({
            sobject<T = object>(): SObject<T> {
                // @ts-ignore
                return {
                    // @ts-ignore
                    create() {
                        return Promise.resolve({ success: false });
                    },
                    // @ts-ignore
                    select(): Query<Array<Partial<T>>> {
                        // @ts-ignore
                        return Promise.resolve([{ locationType: 'warehouse' }]);
                    },
                };
            },
        });

        const locationTypesCmd = `sfdx force:data:soql:query -u "${username}" -q "${QUERY_LOCATION_TYPES}" --apiversion=${apiversion}`;
        const deployCommand = `sfdx force:mdapi:deploy -u "${username}" -d ${EXAMPLE_DIR}/som/ -w 1 --apiversion=${apiversion}`;
        const deployActionsCommand = `sfdx force:mdapi:deploy -u "${username}" -d ${EXAMPLE_DIR}/som/actions/ -w 1 --apiversion=${apiversion}`;
        const deployResult = {
            status: 0,
            name: '',
            message: '',
            exitCode: 0,
            commandName: '',
            stack: '',
            warnings: [],
            result: undefined,
            command: '',
            orgId: '',
        };
        shellStub.withArgs(deployCommand).returns(deployResult);
        shellStub.withArgs(deployActionsCommand).returns(deployResult);
        const locationTypesResult = new Result<QueryResult>();
        locationTypesResult.result = new (class implements QueryResult {
            public done: boolean;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            public records: Record[] = [{ Value: 'warehouse' }];
            public totalSize = 1;
        })();
        shellStub.withArgs(locationTypesCmd).returns(locationTypesResult);

        await assert.rejects(orderManagementQuickstartSetup.run());

        sinon.assert.calledThrice(shellStub);
        sinon.assert.calledWith(shellStub, deployCommand);
        sinon.assert.calledWith(shellStub, deployActionsCommand);

        [shellStub, usernameStub, connectionStub].forEach((stub) => stub.restore());
    });
});
