/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import { cleanName, mkdirSync } from '../fsUtils';

// STATUS FILE Properties
export const LAST_UPDATE = 'last_update';
export const STEP = 'step';
export const HUB_ORG_ID = 'hubOrgId';
export const ENABLED = 'enabled';
export const PERM_SET = 'B2cLiteAccessPermSet';
export const USER_INFO = 'userInfo';
export const INDEX_CREATED = 'isSearchIndexCreated';
export const SCRATCH_ORG_ID = 'scratchOrgId';
export const BUYER_GROUP_NAME = 'buyerGroupName';
export const PUBLISHED = 'isPublished';
export const STORE_ID = 'storeId';
// File Paths
const homedir = os.homedir();
export const B_DIR = `${__dirname}/../../../..`;
export const BASE_DIR = homedir + '/.commerce'; // ; `${__dirname}/../../../..` // use commented if you just want to do local
/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
export const DEVHUB_DIR = (dir = BASE_DIR, hubOrgAdminUsername?) =>
    `${mkdirSync(dir)}/devhubs${hubOrgAdminUsername ? '/' + cleanName(hubOrgAdminUsername) : ''}`;
export const SCRATCH_ORG_DIR = (dir = BASE_DIR, hubOrgAdminUsername, scratchOrgAdminUsername) =>
    `${DEVHUB_DIR(dir, hubOrgAdminUsername)}${scratchOrgAdminUsername ? '/' + cleanName(scratchOrgAdminUsername) : ''}`;
export const STORE_DIR = (dir = BASE_DIR, hubOrgAdminUsername, scratchOrgAdminUsername, storeName) =>
    `${SCRATCH_ORG_DIR(dir, hubOrgAdminUsername, scratchOrgAdminUsername)}${
        storeName ? '/' + cleanName(storeName) : ''
    }`;
export const STATUS_FILE = (dir = BASE_DIR) => `${mkdirSync(dir)}/status`;
export const B2C_CONFIG_OVERRIDE = (dir = BASE_DIR) => `${mkdirSync(dir)}/b2c.config-override.js`;
export const EXAMPLE_DIR = (dir = BASE_DIR) => `${mkdirSync(dir)}/examples`;
export const PATCH_DIR = (dir = BASE_DIR) => `${mkdirSync(dir)}/patches`;
export const JSON_DIR = (dir = BASE_DIR) => mkdirSync(`${dir}/json`);
export const CONFIG_DIR = (dir = BASE_DIR) => `${mkdirSync(dir)}/config`;
export const BUYER_USER_DEF = (dir = BASE_DIR) => `${mkdirSync(dir + '/config')}/buyer-user-def.json`;
export const QUICKSTART_CONFIG = (dir = BASE_DIR) => `${mkdirSync(dir)}/quickstart-config`;
export const PACKAGE_RETRIEVE_TEMPLATE = (type?: string, dir = BASE_DIR) =>
    `${mkdirSync(QUICKSTART_CONFIG(dir))}/${type ? type.toLowerCase() + '-' : ''}package-retrieve-template.xml`;
export const PACKAGE_RETRIEVE = (dir = BASE_DIR) => `${mkdirSync(QUICKSTART_CONFIG(dir))}/package-retrieve.xml`;
export const SFDX_DIR = (dir = homedir) => `${mkdirSync(dir + '/.sfdx')}`;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
