/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { fs } from '@salesforce/core';
import { BASE_DIR } from '../../../src/lib/utils/constants/properties';
import { DevHubConfig } from '../../../src/lib/utils/jsonUtils';
import { Devhub, ScratchOrg, StatusFileManager, Store } from '../../../src/lib/utils/statusFileManager';

describe('Status File Manager', () => {
    function getDevhubConfig() {
        const dhc = new DevHubConfig();
        dhc.hubOrgAdminUsername = 'testhub';
        dhc.scratchOrgAdminUsername = 'testorg';
        dhc.storeName = 'teststore';
        return dhc;
    }
    const devhubconfig = getDevhubConfig();
    const statusFilePath = BASE_DIR + '/status.test.yml';

    it('should save devhub property', async () => {
        const statusFileManager = new StatusFileManager(statusFilePath);
        await statusFileManager.setValue(devhubconfig, 1, 'testing', '1234');
        assert.equal(await statusFileManager.getValue(devhubconfig, new Devhub(), 'testing'), '1234');
    });
    it('should save scratchorg property', async () => {
        const statusFileManager = new StatusFileManager(statusFilePath);
        await statusFileManager.setValue(devhubconfig, 2, 'testing', '1234');
        assert.equal(await statusFileManager.getValue(devhubconfig, new ScratchOrg(), 'testing'), '1234');
    });
    it('should save store property', async () => {
        const statusFileManager = new StatusFileManager(statusFilePath);
        await statusFileManager.setValue(devhubconfig, 3, 'testing', '1234');
        assert.equal(await statusFileManager.getValue(devhubconfig, new Store(), 'testing'), '1234');
    });
    afterEach(() => {
        try {
            fs.unlinkSync(statusFilePath);
        } catch (e) {
            /**/
        }
    });
});
