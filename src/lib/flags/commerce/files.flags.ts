/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags } from '@salesforce/command';

export const filesFlags = {
    prompt: flags.boolean({
        char: 'y',
        default: false,
        description: 'If there is a file difference detected, prompt before overwriting file',
    }),
    filestocopy: flags.array({
        required: true,
        description: 'Array of individual files to copy located directly in source directory',
    }),
    dirstocopy: flags.array({
        required: true,
        description: 'Array of directories (including their contents) located in source directory to copy',
    }),
    copysourcepath: flags.string({
        required: true,
        description: 'Base path for files and directories to be copied from',
    }),
};
