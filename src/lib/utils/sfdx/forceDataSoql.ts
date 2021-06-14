/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { StdioOptions } from 'child_process';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { shellJsonSfdx } from '../shell';
import { Result } from '../jsonUtils';

/**
 * Simply pass a query and option user
 * forceDataSoql(query).json
 *
 * @param query
 * @param user
 * @return shell object with res (raw result of execution or "" if error),
 * error (error object), err (error message), json (json object or "" if not able to parse)
 */
export const forceDataSoql = (query: string, user = ''): Result<QueryResult> => {
    const u = user ? `-u "${user}"` : ''; // TODO should i do something here if there are no results to save on further checking in the code?
    return shellJsonSfdx<QueryResult>(`sfdx force:data:soql:query ${u} -q "${query}" --json`);
}; // TODO make this into a class that returns null for .result.records[0].Id; if there are no results this will prevent all null pointers
/* eslint-disable */
/**
 *
 * @param service
 * @param value
 * @param user
 * @param stdio inherit by default so no return value, change to "" to get result
 */
export function forceDataRecordCreate(service: string, value: string, user = '', stdio: StdioOptions = null) {
    const u = user ? `-u "${user}"` : '';
    try {
        return shellJsonSfdx(`sfdx force:data:record:create ${u} -s "${service}" -v "${value}" --json`, stdio);
    } catch (e) {
        if (
            e.message.indexOf('DUPLICATE_VALUE') < 0 &&
            e.message.indexOf('DUPLICATE_DEVELOPER_NAME') < 0 &&
            e.message.indexOf('already has') < 0
        )
            throw e;
        console.log(service + ', ' + value + ': ' + JSON.parse(e.message).message);
        return e;
    }
}
/* eslint-disable */
/**
 *
 * @param service
 * @param value
 * @param user
 * @param stdio inherit by default so no return value, change to "" to get result
 */
export function forceDataRecordUpdate(service, value, w, user = '', stdio: StdioOptions = 'inherit') {
    const u = user ? `-u "${user}"` : '';
    return shellJsonSfdx(`sfdx force:data:record:update ${u} -s "${service}" -v "${value}" -w "${w}" --json`, stdio);
}
/**
 *
 * @param service
 * @param value
 * @param user
 * @param stdio inherit by default so no return value, change to "" to get result
 */
export function forceDataRecordDelete(service, value, user = '', stdio: StdioOptions = 'inherit') {
    const u = user ? `-u "${user}"` : '';
    return shellJsonSfdx(`sfdx force:data:record:delete ${u} -s "${service}" -i "${value}" --json`, stdio);
}
