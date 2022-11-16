/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { CONFIG_DIR } from '../../../src/lib/utils/constants/properties';
import { getDefinitionFile } from '../../../src/lib/utils/definitionFile';

describe('getDefinitionFile', () => {
    const B2C_DEF_FILE = `${CONFIG_DIR}/b2c-store-scratch-def.json`;
    const B2B_DEF_FILE = `${CONFIG_DIR}/b2b-store-scratch-def.json`;
    const VALID_B2B_DEF_FILE = `${__dirname}/../../../config/b2b-store-scratch-def.json`;

    it('should return default b2c def file given undefined flags', () => {
        const flags = undefined;
        const defFile = getDefinitionFile(flags);
        assert.deepStrictEqual(defFile, B2C_DEF_FILE);
    });

    it('should return default b2c given no type and invalid def file', () => {
        const flags = {
            definitionfile: 'definitionfile',
        };
        const defFile = getDefinitionFile(flags);
        assert.deepStrictEqual(defFile, B2C_DEF_FILE);
    });

    it('should return b2c def file given b2c type and invalid def file', () => {
        const flags = {
            definitionfile: 'definitionfile',
            type: 'b2c',
        };
        const defFile = getDefinitionFile(flags);
        assert.deepStrictEqual(defFile, B2C_DEF_FILE);
    });

    it('should return b2b def file given b2b type and invalid def file', () => {
        const flags = {
            definitionfile: 'definitionfile',
            type: 'b2b',
        };
        const defFile = getDefinitionFile(flags);
        assert.deepStrictEqual(defFile, B2B_DEF_FILE);
    });

    it('should return same def file given a valid def file', () => {
        const flags = {
            definitionfile: VALID_B2B_DEF_FILE,
        };
        const defFile = getDefinitionFile(flags);
        assert.deepStrictEqual(defFile, flags.definitionfile);
    });
});
