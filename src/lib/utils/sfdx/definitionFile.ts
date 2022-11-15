/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { fs } from '@salesforce/core';
import { CONFIG_DIR } from '../constants/properties';

/**
 * Retrieves definition file from flags object
 * If definition file does not exist, will return b2c (default) or b2b definition file
 *
 * @param flags this.flags
 * @returns definition file path as a string
 */
export const getDefinitionFile = (flags: Record<string, unknown>): string => {
    // default is b2c
    let defFile = CONFIG_DIR + '/b2c-store-scratch-def.json';
    if (flags) {
        if (!flags.definitionFile || !fs.existsSync(flags.definitionfile as string)) {
            if (flags.type) defFile = CONFIG_DIR + '/' + (flags.type as string) + '-store-scratch-def.json';
        } else {
            defFile = flags.definitionfile as string;
        }
    }
    return defFile;
};
