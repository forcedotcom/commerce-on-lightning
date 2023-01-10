/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { fs } from '@salesforce/core';
import { BASE_DIR, CONFIG_DIR } from './constants/properties';
import { SfdxProject } from './jsonUtils';
import { mkdirSync } from './fsUtils';

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
        if (!flags.definitionfile || !fs.existsSync(flags.definitionfile as string)) {
            if (flags.type) defFile = CONFIG_DIR + '/' + (flags.type as string) + '-store-scratch-def.json';
        } else {
            defFile = flags.definitionfile as string;
        }
    }
    return defFile;
};

/**
 * Creates SFDX project file from the base directory
 *
 * @param apiVersion The api version in set in the file
 * @param directoryPath The directory to create the file
 */
export function createSfdxProjectFile(apiVersion: string, directoryPath: string): void {
    const sfdxProject: SfdxProject = Object.assign(new SfdxProject(), fs.readJsonSync(BASE_DIR + '/sfdx-project.json'));
    sfdxProject.sourceApiVersion = apiVersion;
    const sfdxProjectFile = mkdirSync(directoryPath) + '/sfdx-project.json';
    fs.writeFileSync(sfdxProjectFile, JSON.stringify(sfdxProject, null, 4));
}
