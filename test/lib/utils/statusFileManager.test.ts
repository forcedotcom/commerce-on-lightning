/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { fs } from '@salesforce/core';
import { BASE_DIR } from '../../../src/lib/utils/constants/properties';
import { StatusFileManager } from '../../../src/lib/utils/statusFileManager';

describe('Status File Manager', () => {
    function getDevhubConfig() {
        return {
            hubOrgAdminUsername: 'testhub',
            scratchOrgAdminUsername: 'testorg',
            storeName: 'teststore',
        };
    }
    function newStatusFileManager() {
        return new StatusFileManager(
            getDevhubConfig().hubOrgAdminUsername,
            getDevhubConfig().scratchOrgAdminUsername,
            getDevhubConfig().storeName,
            statusFilePath
        );
    }
    const statusFilePath = BASE_DIR + '/status.test.yml';

    it('should save store property', async () => {
        const statusFileManager = newStatusFileManager();
        await statusFileManager.setValue('testing', '1234');
        assert.equal(await statusFileManager.getValue('testing'), '1234');
    });
    afterEach(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            fs.unlinkSync(statusFilePath);
        } catch (e) {
            /**/
        }
    });
});
