/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { spawn } from 'child_process';

let command = '';

switch (os.platform()) {
    case 'win32':
        command = 'del -f .oclif.manifest.json && yarn run prepack && husky install';
        break;
    default:
        command = 'rm -f .oclif.manifest.json && yarn run prepack && husky install';
        break;
}

const child = spawn(command, { shell: true });

child.stderr.on('data', (data) => {
    // eslint-disable-next-line no-console
    process.stderr.write(String(data));
});

child.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    process.stdout.write(String(data));
});
