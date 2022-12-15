/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { fs, Messages, SfdxError } from '@salesforce/core';
import { SfdxCommand } from '@salesforce/command';
import { BASE_DIR } from '../../../lib/utils/constants/properties';
import { copyFolderRecursiveWithConfirm, mkdirSync } from '../../../lib/utils/fsUtils';
import { filesFlags } from '../../../lib/flags/commerce/files.flags';

const TOPIC = 'files';
const CMD = `commerce:${TOPIC}:copy`;
const msgs = Messages.loadMessages('@salesforce/commerce', 'commerce');

export class FilesCopy extends SfdxCommand {
    public static description = msgs.getMessage('files.cmdDescription', [BASE_DIR]);
    public static examples = [
        `sfdx ${CMD} -y --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt" --dirstocopy "dir1,dir2,dir3"`,
        `sfdx ${CMD} --prompt --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt" --dirstocopy "dir1,dir2,dir3"`,
        `sfdx ${CMD} --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt" --dirstocopy "dir1,dir2,dir3"`,
    ];
    public static varargs = {
        required: false,
        validator: (name: string): void => {
            // Whitelist varargs parameter names
            if (!FilesCopy.vargsAllowList.includes(name)) {
                const errMsg = `Invalid parameter [${name}] found`;
                const errName = 'InvalidVarargName';
                const errAction = `Choose one of these parameter names: ${FilesCopy.vargsAllowList.join()}`;
                throw new SfdxError(errMsg, errName, [errAction]);
            }
        },
    };

    public static get vargsAllowList(): string[] {
        return ['prompt', 'copysourcepath', 'filestocopy', 'dirstocopy'];
    }

    protected static flagsConfig = {
        ...filesFlags,
    };

    public async run(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const prompt = this.flags.prompt;
        mkdirSync(BASE_DIR);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const sourceBaseDir: string = this.flags.copysourcepath;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const dirsToCopy = this.flags.dirstocopy;
        let dirs: string[];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        if (Array.isArray(dirsToCopy)) dirs = dirsToCopy;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        else dirs = dirsToCopy !== null ? dirsToCopy.split(',') : null;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const filesToCopy = this.flags.filestocopy;
        let files: string[];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        if (Array.isArray(filesToCopy)) files = filesToCopy;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        else files = filesToCopy !== null ? filesToCopy.split(',') : null;
        this.ux.log(JSON.stringify(files));
        if (sourceBaseDir !== null) {
            for (const d of dirs) {
                await copyFolderRecursiveWithConfirm(`${sourceBaseDir}/${d}`, BASE_DIR, prompt);
            }
            files
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                .filter((f) => !fs.existsSync(`${BASE_DIR}/${f}`))
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
                .forEach((f) => fs.copyFileSync(`${sourceBaseDir}/${f}`, `${BASE_DIR}/${f}`));
        }
    }
}
