/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import path from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { addAllowedArgs, modifyArgFlag, removeFlagBeforeAll } from '../../../lib/utils/args/flagsUtils';
import { BASE_DIR, EXAMPLE_DIR, FILE_COPY_ARGS } from '../../../lib/utils/constants/properties';
import { mkdirSync, readFileSync, renameRecursive } from '../../../lib/utils/fsUtils';
import { shell } from '../../../lib/utils/shell';
import { convertStoreScratchDefToExamples, parseStoreScratchDef } from '../../../lib/utils/jsonUtils';
import { FilesCopy } from '../files/copy';
import { getDefinitionFile } from '../../../lib/utils/definitionFile';

const TOPIC = 'examples';
const CMD = `commerce:${TOPIC}:convert`;
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class ExamplesConvert extends SfdxCommand {
    // TODO fix this to use store-def.json file
    public static description = messages.getMessage('convert.cmdDescription');

    public static examples = [`sfdx ${CMD} -f store-scratch-def.json`]; // TODO documentation including examples and descriptions
    protected static flagsConfig = {
        definitionfile: flags.filepath({
            char: 'f',
            required: true,
            description: messages.getMessage('convertFlags.configFileDescription'),
        }),
        outputdir: flags.string({
            char: 'd',
            default: BASE_DIR + '/force-app',
            description: messages.getMessage('convertFlags.outputDirDescription'),
        }),
        sourcepath: flags.string({
            char: 'p',
            multiple: true,
            default: '',
            description: messages.getMessage('convertFlags.convertDescription'),
        }),
        type: flags.string({
            char: 'o',
            options: ['b2c', 'b2b'],
            parse: (input) => input.toLowerCase(),
            description: 'The type of store you want to create',
        }),
        'store-name': flags.string({
            char: 'n',
            default: '1commerce',
            description: messages.getMessage('convertFlags.storeNameDescription'),
            required: true,
        }),
        prompt: flags.boolean({
            char: 'y',
            default: false,
            description: 'If there is a file difference detected, prompt before overwriting file',
        }),
    };

    public async run(): Promise<AnyJson> {
        // Copy all example files
        FILE_COPY_ARGS.forEach((v) => modifyArgFlag(v.args, v.value, this.argv));
        await FilesCopy.run(addAllowedArgs(this.argv, FilesCopy), this.config);
        this.flags.definitionfile = getDefinitionFile(this.flags);
        const scratchDef = parseStoreScratchDef(this.flags);
        const paths = convertStoreScratchDefToExamples(scratchDef);
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
            path.join(this.flags.outputdir, 'force-app')
        );
        if (scratchDef.settings.lwc) {
            const pathFrom = path.join(EXAMPLE_DIR, scratchDef.edition.toLowerCase(), '/lwc/force-app/main/default');
            const pathTo = path.join(this.flags.outputdir as string, '/force-app/main/default');

            if (scratchDef.settings.lwc.classes)
                scratchDef.settings.lwc.classes.forEach((clz) =>
                    shell(`cp -r ${path.join(pathFrom, 'classes', clz)} ${mkdirSync(path.join(pathTo, 'classes'))}`)
                );
            if (scratchDef.settings.lwc.lwc)
                scratchDef.settings.lwc.lwc.forEach((clz) =>
                    shell(`cp -r ${path.join(pathFrom, 'lwc', clz)} ${mkdirSync(path.join(pathTo, 'lwc'))}`)
                );
        }
        return { convertedExamples: true };
    }

    private convert(r: string[]): void {
        r.map((l) => l.replace('$EXAMPLE_DIR', EXAMPLE_DIR).replace('~', os.homedir())).forEach((dir) => {
            shell(`cd ${this.flags.outputdir as string}`);
            shell(`sfdx force:mdapi:convert -r ${dir} -d ${path.join(this.flags.outputdir as string, 'force-app')}`);
        });
    }
}
