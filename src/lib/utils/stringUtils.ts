/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export function convertKabobToCamel(kabob: string): string {
    let camel = '';
    for (let i = 0; i < kabob.length; i++)
        if (kabob.charAt(i) === '-') camel += kabob.charAt(++i).toUpperCase();
        else camel += kabob.charAt(i);
    return camel;
}
export function convertToCamelKabob(camel: string): string {
    let kabob = '';
    for (let i = 0; i < camel.length; i++)
        if (camel.charAt(i) === camel.charAt(i).toUpperCase()) kabob += '-' + camel.charAt(i).toLowerCase();
        else kabob += camel.charAt(i);
    return kabob;
}
