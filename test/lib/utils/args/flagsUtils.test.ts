/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { addAllowedArgs, getPassedArgs } from '../../../../src/lib/utils/args/flagsUtils';
import { StoreCreate } from '../../../../src/commands/commerce/store/create';

describe('flagsUtils addAllowedArgs', () => {
    it('should add only args that the sfdxcommand Auth allows', async () => {
        const res = addAllowedArgs(['-c', 'hi', '-b', 'bye'], StoreCreate);
        // -c is not allowed but -b is so i don't expect -c or it's value to exist in assert
        assert.deepEqual(res, ['-b', 'bye']);
    });
});

describe('flagUtils getPassedArgs', () => {
    it('should accept empty args list', () => {
        const argv: string[] = [];
        const passedArgs = getPassedArgs(argv);
        assert(Object.keys(passedArgs).length === 0);
    });

    it('should ignore targetdevhubusername (-v flag) and targetusername (-u flag)', () => {
        const argv: string[] = ['-v', 'ceo@mydevhub.com', '-u', 'demo@1commerce.com'];
        const passedArgs = getPassedArgs(argv);
        assert(Object.keys(passedArgs).length === 0);
    });

    it('should accept single boolean arg', () => {
        const argv: string[] = ['-y'];
        const expectedArgs = { prompt: true };
        const passedArgs = getPassedArgs(argv);
        assert.deepStrictEqual(passedArgs, expectedArgs);
    });

    it('should accept arguments with whitespace', () => {
        const argv: string[] = ['-n', 'b2bstore01', '-o', 'b2b', '-t', 'B2B Commerce (LWR)'];
        const expectedArgs = {
            'store-name': 'b2bstore01',
            type: 'b2b',
            templatename: 'B2B Commerce (LWR)',
        };
        const passedArgs = getPassedArgs(argv);
        assert.deepStrictEqual(passedArgs, expectedArgs);
    });

    it('should accept arguments without whitespace', () => {
        const argv: string[] = ['-nb2bstore01', '-ob2b', '-tB2B Commerce (LWR)'];
        const expectedArgs = {
            'store-name': 'b2bstore01',
            type: 'b2b',
            templatename: 'B2B Commerce (LWR)',
        };
        const passedArgs = getPassedArgs(argv);
        assert.deepStrictEqual(passedArgs, expectedArgs);
    });

    it('should accept arguments in verbose mode', () => {
        const argv: string[] = ['--store-name', 'b2bstore01', '--type', 'b2b', '--templatename', 'B2B Commerce (LWR)'];
        const expectedArgs = {
            'store-name': 'b2bstore01',
            type: 'b2b',
            templatename: 'B2B Commerce (LWR)',
        };
        const passedArgs = getPassedArgs(argv);
        assert.deepStrictEqual(passedArgs, expectedArgs);
    });

    it('should be able to accept combination of arguments', () => {
        const argv: string[] = [
            '-f',
            '~/.commerce/config/b2b-store-scratch-def.json',
            '-y',
            '-nb2bstore01',
            '-o',
            'b2b',
            '--buyer-username',
            'b2bbuyer_u1@1commerce.com',
            '-t',
            'B2B Commerce (LWR)',
            '--targetdevhubusername',
            'ceo@mydevhub.com',
            '-udemo@1commerce.com',
        ];
        const expectedArgs = {
            definitionfile: '~/.commerce/config/b2b-store-scratch-def.json',
            prompt: true,
            'store-name': 'b2bstore01',
            type: 'b2b',
            'buyer-username': 'b2bbuyer_u1@1commerce.com',
            templatename: 'B2B Commerce (LWR)',
        };
        const passedArgs = getPassedArgs(argv);
        assert.deepStrictEqual(passedArgs, expectedArgs);
    });
});
