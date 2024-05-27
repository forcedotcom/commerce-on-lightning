/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { StdioOptions } from 'child_process';
import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
import { OutputFlags } from '@oclif/parser';
import { Logger } from '@salesforce/core';
import { shellJsonSfdx } from '../shell';
import { Result } from '../jsonUtils';
import { appendCommonFlags } from '../args/flagsUtils';

/**
 * Simply pass a query and option user
 * forceDataSoql(query).json
 *
 * @param query
 * @param user
 * @param flags
 * @return shell object with res (raw result of execution or "" if error),
 * error (error object), err (error message), json (json object or "" if not able to parse)
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const forceDataSoql = (
    query: string,
    user = '',
    flags: OutputFlags<any>,
    logger: Logger
): Result<QueryResult> => {
    const u = user ? `-u "${user}"` : ''; // TODO should i do something here if there are no results to save on further checking in the code?
    return shellJsonSfdx<QueryResult>(appendCommonFlags(`sf data query ${u} --query "${query}" --json`, flags, logger));
}; // TODO make this into a class that returns null for .result.records[0].Id; if there are no results this will prevent all null pointers
/* eslint-disable */
/**
 *
 * @param service
 * @param value
 * @param user
 * @param stdio inherit by default so no return value, change to "" to get result
 */
export function forceDataRecordCreate(
    service: string,
    value: string,
    user = '',
    flags: OutputFlags<any>,
    logger: Logger,
    stdio: StdioOptions = null
) {
    const u = user ? `--target-org "${user}"` : '';
    try {
        return shellJsonSfdx(
            appendCommonFlags(
                `sf data create record ${u} --sobject "${service}" --values "${value}" --json`,
                flags,
                logger
            ),
            stdio
        );
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
 * @param w
 * @param user
 * @param flags
 * @param logger
 * @param stdio inherit by default so no return value, change to "" to get result
 */
export function forceDataRecordUpdate(
    service,
    value,
    w,
    user = '',
    flags: OutputFlags<any>,
    logger: Logger,
    stdio: StdioOptions = 'inherit'
) {
    const u = user ? `-u "${user}"` : '';
    return shellJsonSfdx(
        appendCommonFlags(
            `sf data update record ${u} --sobject "${service}" --values "${value}" --where "${w}" --json`,
            flags,
            logger
        ),
        stdio
    );
}
/**
 *
 * @param service
 * @param value
 * @param user
 * @param stdio inherit by default so no return value, change to "" to get result
 */
export function forceDataRecordDelete(
    service,
    value,
    user = '',
    flags: OutputFlags<any>,
    logger: Logger,
    stdio: StdioOptions = 'inherit'
) {
    const u = user ? `-u "${user}"` : '';
    return shellJsonSfdx(
        appendCommonFlags(
            `sf data delete record ${u} --sobject "${service}" --record-id "${value}" --json`,
            flags,
            logger
        ),
        stdio
    );
}
