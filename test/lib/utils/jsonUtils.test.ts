/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { parseStoreScratchDef, StoreScratchDef } from '../../../src/lib/utils/jsonUtils';

describe('Json Utils Override Json With Flags', () => {
    it('should override json values if its a passed in flag', async () => {
        const obj = { hubOrgAdminUsername: 'ceo@mydevhub.com' };
        // overrideJsonWithFlags(devHubFlags, { 'instance-url': 'hello' }, obj);
        // assert.equal(obj['instanceUrl'], 'hello');
        assert.equal(obj['hubOrgAdminUsername'], 'ceo@mydevhub.com');
    });
});

describe('Json Utils Parse JSON Config with Flags', () => {
    it('should parse the devhub json file', async () => {
        // const obj = parseJSONConfigWithFlags(B_DIR + '/devhub-configuration.json', devHubFlags, {});
        // assert.equal(obj['instanceUrl'], 'https://localhost:6101');
    });
    it('should override json file with flags', async () => {
        // const obj = parseJSONConfigWithFlags(B_DIR + '/devhub-configuration.json', devHubFlags, {
        //     'instance-url': 'hi',
        // });
        // assert.equal(obj['instanceUrl'], 'hi');
        // assert.equal(obj['hubOrgAlias'], 'devhub');
    });
});

const getStoreScratchDef = (sctDef): StoreScratchDef => {
    return Object.assign(new StoreScratchDef(), sctDef) as StoreScratchDef;
};

describe('Json Utils parse store scratch def', () => {
    const B2C_DEF_FILE = `${__dirname}/../../../config/b2c-store-scratch-def.json`;
    const B2CsctDef = {
        storeName: 'Test_B2C_Company',
        edition: 'B2C',
        template: 'b2c-lite-storefront',
        features: ['GuestUser'],
        settings: {
            checkout: {
                paymentGatewayIntegration: 'Salesforce',
                integrations: true,
                orderConfirmationEmailFlow: true,
                retriggerPlaceOrder: true,
            },
            users: {
                buyerUserProfileSetup: true,
                sharingSettingsSetup: true,
            },
            diagnostic: {
                commerceDiagnosticEventSetup: true,
            },
            cspTrustedSites: {
                amazonaws: true,
            },
            productImport: ['Alpine-small.csv'],
        },
    };

    it('should return parsed version of definition file', () => {
        const flags = {
            definitionfile: B2C_DEF_FILE,
        };
        const sctDef = parseStoreScratchDef(flags);
        const expectedSctDef = getStoreScratchDef(B2CsctDef);
        assert.deepStrictEqual(sctDef, expectedSctDef);
    });

    it('should replace store name/type/template name if available in flags', () => {
        const flags = {
            'store-name': 'testStore_1',
            type: 'B2B',
            templatename: 'B2B Commerce',
            definitionfile: B2C_DEF_FILE,
        };
        const replacements = {
            storeName: 'testStore_1',
            edition: 'B2B',
            template: 'B2B Commerce',
        };
        const sctDef = parseStoreScratchDef(flags);
        const expectedSctDef = getStoreScratchDef({ ...B2CsctDef, ...replacements });
        assert.deepStrictEqual(sctDef, expectedSctDef);
    });

    it('should replace spaces in flags store name with underscores', () => {
        const flags = {
            'store-name': 'very cool store',
            definitionfile: B2C_DEF_FILE,
        };
        const replacements = { storeName: 'very_cool_store' };
        const sctDef = parseStoreScratchDef(flags);
        const expectedSctDef = getStoreScratchDef({ ...B2CsctDef, ...replacements });
        assert.deepStrictEqual(sctDef, expectedSctDef);
    });
});
