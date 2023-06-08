/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const BASE_10 = 10;

function isAtLeastVersion(currentVersion: string, desiredVersion: number): boolean {
    return parseInt(currentVersion, BASE_10) >= desiredVersion;
}

/**
 * Description, iconURI and isApplication fields are added to RegisteredExternalService
 * table in build 246 (api version 59)
 *
 * @param currentAPIVersion Current api version
 * @returns
 */
export const registerTableNewFieldsToggle: (string) => boolean = (currentAPIVersion: string) => {
    return isAtLeastVersion(currentAPIVersion, 59);
};
