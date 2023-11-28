/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'path';
import { fs } from '@salesforce/core';
import { ExamplesConvert } from '../../commands/commerce/examples/convert';
import { BASE_DIR, STATUS_FILE } from './constants/properties';
import { createSfdxProjectFile } from './definitionFile';

/**
 * Builder pattern for command requirements or just call one method statically
 * order matters
 */
export class Requires {
    public commands: CMD[] = [];

    public static async examplesConverted(
        dir: string = BASE_DIR,
        storeName = '',
        storeType = '',
        configFile = '',
        apiVersion = '',
        force = 'false'
    ): Promise<void> {
        const forceAppDir = path.join(dir, 'force-app');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        if (force === 'true' || !fs.existsSync(forceAppDir) || !fs.lstatSync(forceAppDir).isDirectory()) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (fs.existsSync(forceAppDir) && !fs.lstatSync(forceAppDir).isDirectory())
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                fs.unlinkSync(forceAppDir); // this shouldn't happen, but if it does...
            createSfdxProjectFile(apiVersion, dir);
            await ExamplesConvert.run(['-d', dir, '-n', storeName, '-f', configFile, '-o', storeType]);
        }
    }

    public step(step: string, status = STATUS_FILE()): Requires {
        this.commands.push(new CMD('step', [step, status]));
        return this;
    }
    public examplesConverted(
        dir: string = BASE_DIR,
        storeName = '',
        storeType = '',
        configFile = '',
        apiVersion = '',
        force = 'false'
    ): Requires {
        this.commands.push(new CMD('examplesConverted', [dir, storeName, storeType, configFile, apiVersion, force]));
        return this;
    }
    public async build(): Promise<void> {
        for (const cmd of this.commands)
            switch (cmd.key) {
                case 'examplesConverted':
                    await Requires.examplesConverted(...cmd.properties);
                    break;
            }
    }
}
class CMD {
    public key: string;
    public properties: string[];

    public constructor(key: string, properties: string[]) {
        this.key = key;
        this.properties = properties;
    }
}
