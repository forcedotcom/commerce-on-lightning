/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { spawn } from 'child_process';

let command = '';
let shellOptions = {};

switch (os.platform()) {
    case 'win32':
        command = 'Remove-Item -Force .oclif.manifest.json; yarn run prepack; husky install';
        shellOptions = { shell : 'powershell.exe' };
        break;
    default:
        command = 'rm -f .oclif.manifest.json && yarn run prepack && husky install';
        shellOptions = { shell : '/bin/sh' };
        break;
}

const child = spawn(command, shellOptions);

child.stderr.on('data', (data) => {
    // eslint-disable-next-line no-console
    process.stderr.write(String(data));
});

child.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    process.stdout.write(String(data));
});
