/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import path from 'path';
import { cleanName, mkdirSync } from '../fsUtils';

// STATUS FILE Properties
export const STEP = 'step';
export const ENABLED = 'enabled';
// File Paths
const homedir = os.homedir();
export const B_DIR = path.join(__dirname, '..', '..', '..', '..');
export const BASE_DIR = path.join(homedir, '.commerce');
export const DEVHUB_DIR = (dir = BASE_DIR, hubOrgAdminUsername?: string): string =>
    path.join(mkdirSync(dir), 'devhubs', hubOrgAdminUsername ? cleanName(hubOrgAdminUsername) : '');
export const SCRATCH_ORG_DIR = (dir = BASE_DIR, hubOrgAdminUsername: string, scratchOrgAdminUsername: string): string =>
    path.join(DEVHUB_DIR(dir, hubOrgAdminUsername), scratchOrgAdminUsername ? cleanName(scratchOrgAdminUsername) : '');
export const STORE_DIR = (
    dir = BASE_DIR,
    hubOrgAdminUsername: string,
    scratchOrgAdminUsername: string,
    storeName: string
): string =>
    path.join(
        SCRATCH_ORG_DIR(dir, hubOrgAdminUsername, scratchOrgAdminUsername),
        storeName ? cleanName(storeName) : ''
    );
export const STATUS_FILE = (dir = BASE_DIR): string => path.join(mkdirSync(dir), 'status');
export const EXAMPLE_DIR = path.join(mkdirSync(BASE_DIR), 'examples');
export const JSON_DIR = (dir = BASE_DIR): string => mkdirSync(path.join(dir, 'json'));
export const CONFIG_DIR = path.join(mkdirSync(BASE_DIR), 'config');
export const BUYER_USER_DEF = (dir = BASE_DIR): string =>
    path.join(mkdirSync(path.join(dir, 'config')), 'buyer-user-def.json');
export const QUICKSTART_CONFIG = (dir = BASE_DIR): string => path.join(mkdirSync(dir), 'quickstart-config');
export const PACKAGE_RETRIEVE_TEMPLATE = (type?: string, dir = BASE_DIR): string =>
    path.join(
        mkdirSync(QUICKSTART_CONFIG(dir)),
        `${type ? type.toLowerCase() + '-' : ''}package-retrieve-template.xml`
    );
export const PACKAGE_RETRIEVE = (dir = BASE_DIR): string =>
    path.join(mkdirSync(QUICKSTART_CONFIG(dir)), 'package-retrieve.xml');
export const SFDX_DIR = (dir = homedir): string => mkdirSync(path.join(dir, '.sfdx'));
export const FILES_TO_COPY = 'sfdx-project.json';
export const DIRS_TO_COPY = 'examples,json,quickstart-config,config';
export const FILE_COPY_ARGS = [
    { args: ['--copysourcepath'], value: B_DIR },
    { args: ['--dirstocopy'], value: DIRS_TO_COPY },
    { args: ['--filestocopy'], value: FILES_TO_COPY },
];
