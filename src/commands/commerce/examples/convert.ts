/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import { SfdxCommand } from '@salesforce/command';
import { fs, Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { allFlags } from '../../../lib/flags/commerce/all.flags';
import { exampleFlags } from '../../../lib/flags/commerce/convert.flags';
import { filterFlags, removeFlagBeforeAll } from '../../../lib/utils/args/flagsUtils';
import { BASE_DIR, CONFIG_DIR, EXAMPLE_DIR } from '../../../lib/utils/constants/properties';
import { copyFileSync, mkdirSync, readFileSync, renameRecursive } from '../../../lib/utils/fsUtils';
import { shell } from '../../../lib/utils/shell';
import { convertStoreScratchDefToExamples, parseStoreScratchDef } from '../../../lib/utils/jsonUtils';

const TOPIC = 'examples';
const CMD = `commerce:${TOPIC}:convert`;
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class ExamplesConvert extends SfdxCommand {
    // TODO fix this to use store-def.json file
    public static description = messages.getMessage('convert.cmdDescription');

    public static examples = [`sfdx ${CMD} -f store-scratch-def.json`]; // TODO documentation including examples and descriptions

    protected static flagsConfig = {
        ...exampleFlags,
        ...filterFlags(['store-name'], allFlags),
    };

    public async run(): Promise<AnyJson> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        if (!this.flags.definitionfile || !fs.existsSync(this.flags.definitionfile)) {
            this.flags.definitionfile = CONFIG_DIR + '/store-scratch-def.json';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            fs.copyFileSync(
                CONFIG_DIR + `/${(this.flags.type as string).toLowerCase()}-store-scratch-def.json`,
                CONFIG_DIR + '/store-scratch-def.json'
            );
        }
        const scratchDef = parseStoreScratchDef(this.flags.definitionfile);
        const paths = convertStoreScratchDefToExamples(scratchDef);
        copyFileSync(BASE_DIR + '/sfdx-project.json', mkdirSync(this.flags.outputdir));
        if ((this.flags.sourcepath as string).indexOf('-v') >= 0)
            this.flags.sourcepath = removeFlagBeforeAll('-v', this.flags.sourcepath);
        if (!this.flags.sourcepath && this.flags['examples-convert'])
            this.flags.sourcepath = this.flags['examples-convert'] as string;
        if (this.flags.sourcepath)
            // if you pass -v meta path to convert then don't read in the config file, basically override config file
            this.convert(this.flags.sourcepath);
        else if (paths) this.convert(paths);
        else
            this.convert(
                readFileSync(this.flags['config-file'])
                    .toString()
                    .split('\n')
                    .filter((l) => l && !l.startsWith('#'))
            );
        // this command is required to run from within an sfdx project if running from ide
        await renameRecursive(
            [{ name: 'InsertStoreNameHere', value: this.flags['store-name'] as string }],
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `${this.flags.outputdir}/force-app`
        );
        if (scratchDef.settings.lwc) {
            const pathFrom = EXAMPLE_DIR + '/' + scratchDef.edition.toLowerCase() + '/lwc/force-app/main/default';
            const pathTo = (this.flags.outputdir as string) + '/force-app/main/default';
            if (scratchDef.settings.lwc.classes)
                scratchDef.settings.lwc.classes.forEach((clz) =>
                    shell(`cp -r ${pathFrom}/classes/${clz} ${mkdirSync(pathTo + '/classes/')}`)
                );
            if (scratchDef.settings.lwc.lwc)
                scratchDef.settings.lwc.lwc.forEach((clz) =>
                    shell(`cp -r ${pathFrom}/lwc/${clz} ${mkdirSync(pathTo + '/lwc/')}`)
                );
        }
        return { convertedExamples: true };
    }

    private convert(r: string[]): void {
        r.map((l) => l.replace('$EXAMPLE_DIR', EXAMPLE_DIR).replace('~', os.homedir())).forEach((dir) =>
            shell(
                `cd ${this.flags.outputdir as string} && sfdx force:mdapi:convert -r ${dir} -d ${
                    this.flags.outputdir as string
                }/force-app`
            )
        );
    }
}
