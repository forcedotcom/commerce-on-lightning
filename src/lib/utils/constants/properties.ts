/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import { cleanName, mkdirSync } from '../fsUtils';

// STATUS FILE Properties
export const STEP = 'step';
export const ENABLED = 'enabled';
// File Paths
const homedir = os.homedir();
export const B_DIR = `${__dirname}/../../../..`;
export const BASE_DIR = homedir + '/.commerce';
export const DEVHUB_DIR = (dir = BASE_DIR, hubOrgAdminUsername?: string): string =>
    `${mkdirSync(dir)}/devhubs${hubOrgAdminUsername ? '/' + cleanName(hubOrgAdminUsername) : ''}`;
export const SCRATCH_ORG_DIR = (dir = BASE_DIR, hubOrgAdminUsername: string, scratchOrgAdminUsername: string): string =>
    `${DEVHUB_DIR(dir, hubOrgAdminUsername)}${scratchOrgAdminUsername ? '/' + cleanName(scratchOrgAdminUsername) : ''}`;
export const STORE_DIR = (
    dir = BASE_DIR,
    hubOrgAdminUsername: string,
    scratchOrgAdminUsername: string,
    storeName: string
): string =>
    `${SCRATCH_ORG_DIR(dir, hubOrgAdminUsername, scratchOrgAdminUsername)}${
        storeName ? '/' + cleanName(storeName) : ''
    }`;
export const STATUS_FILE = (dir = BASE_DIR): string => `${mkdirSync(dir)}/status`;
export const EXAMPLE_DIR = `${mkdirSync(BASE_DIR)}/examples`;
export const JSON_DIR = (dir = BASE_DIR): string => mkdirSync(`${dir}/json`);
export const CONFIG_DIR = mkdirSync(BASE_DIR) + '/config';
export const BUYER_USER_DEF = (dir = BASE_DIR): string => `${mkdirSync(dir + '/config')}/buyer-user-def.json`;
export const QUICKSTART_CONFIG = (dir = BASE_DIR): string => `${mkdirSync(dir)}/quickstart-config`;
export const PACKAGE_RETRIEVE_TEMPLATE = (type?: string, dir = BASE_DIR): string =>
    `${mkdirSync(QUICKSTART_CONFIG(dir))}/${type ? type.toLowerCase() + '-' : ''}package-retrieve-template.xml`;
export const PACKAGE_RETRIEVE = (dir = BASE_DIR): string => `${mkdirSync(QUICKSTART_CONFIG(dir))}/package-retrieve.xml`;
export const SFDX_DIR = (dir = homedir): string => `${mkdirSync(dir + '/.sfdx')}`;
