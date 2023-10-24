/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { IConfig } from '@oclif/config';
import { $$ } from '@salesforce/command/lib/test';
import { assert } from 'chai';
import { test } from '@oclif/test';
import { AuthInfo, Connection, Org } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { ProductsImport } from '../../../../src/commands/commerce/products/import';
import { StoreCreate } from '../../../../src/commands/commerce/store/create';
import { Result } from '../../../../src/lib/utils/jsonUtils';
import * as shellExports from '../../../../src/lib/utils/shell';
import * as flagHelpers from '../../../../src/lib/utils/args/flagsUtils';

describe('commerce:products:import', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    afterEach(() => {
        sinon.restore();
    });

    it('Calls out to the Async Product import api', async function () {
        // Setting the mock values
        const devhubUsername = 'test@devhub.com';
        const orgUser = 'test_org@1commerce.com';
        const storeName = 'testStore';
        const fileUploadID = 'file_upload_id';
        const storeID = 'store_id';
        const flagObject = {
            username: orgUser,
            apiversion: '59.0',
            alias: 'a',
            'store-name': storeName,
            'products-file-csv': '/home/runner/.commerce/examples/csv/Alpine-small.csv',
        };
        const mockRequestBody = {
            importConfiguration: {
                importSource: {
                    contentVersionId: fileUploadID,
                },
                importSettings: {
                    webstore: {
                        webstoreId: storeID,
                    },
                },
            },
        };

        const fileUploadQueryResult = new Result();
        fileUploadQueryResult.result = { Id: 'file_upload_id' };

        const buyerGroupQueryResult = new Result();
        buyerGroupQueryResult.result = { records: [{ Name: 'Mock_Name' }] };

        sinon
            .stub(shellExports, 'shellJsonSfdx')
            .onFirstCall()
            .returns(fileUploadQueryResult)
            .onSecondCall()
            .returns(buyerGroupQueryResult);

        const mockOrg = new Org({});
        sinon.stub(mockOrg, 'getUsername').returns(devhubUsername);

        const storeCreateCommandMock = sinon.mock(StoreCreate);
        storeCreateCommandMock.expects('getStoreId').once().onCall(0).returns(storeID);

        const testConnection = await Connection.create({
            authInfo: await AuthInfo.create({ username: orgUser }),
            connectionOptions: {},
        });

        const testConnectionMock = sinon.mock(testConnection);

        sinon.stub(mockOrg, 'getConnection').returns(testConnection);
        testConnectionMock.expects('baseUrl').once().returns('https://baseurl.com');

        test.nock('https://baseurl.com', (api) => {
            api.post('/commerce/management/import/product/jobs', mockRequestBody).reply(200).done();
        });

        // Test is starting.
        const productImportCommand = new ProductsImport([], config);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        productImportCommand.flags = flagObject;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        productImportCommand.ux = stubInterface<UX>($$.SANDBOX);

        productImportCommand.org = mockOrg;

        const importFunction = sinon.spy(productImportCommand, 'importFromUploadedFile');

        sinon.stub(productImportCommand.org, 'getDevHubOrg').resolves(mockOrg);

        const cmd = `sfdx commerce:products:import \
        --targetdevhubusername="${devhubUsername}" \
        --apiversion="${flagObject.apiversion}" \
        --json`;

        sinon.stub(flagHelpers, 'appendCommonFlags').returns(cmd);

        await productImportCommand.run();

        assert(importFunction.called);
    });
});
