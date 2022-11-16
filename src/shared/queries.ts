/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { retry } from '@lifeomic/attempt';
import { Connection } from '@salesforce/core';
import { QueryResult, Record } from './typedefs';

interface SingleRecordQueryInputs {
    conn: Connection;
    query: string;
    returnChoices?: boolean;
    choiceField?: string;
    tooling?: boolean;
}

const singleRecordQuery = async ({
    conn,
    query,
    returnChoices = false,
    choiceField = 'Name',
    tooling = false,
}: SingleRecordQueryInputs): Promise<Record> => {
    // const result = tooling ? ((await conn.tooling.query(query)) as QueryResult) : ((await conn.query(query)) as QueryResult);

    // unfortunately, sometime you get a 404 bad_id error if the username isn't queryable yet.  retry prevents that.
    const result = (await retry(
        async () => {
            return tooling ? conn.tooling.query(query) : conn.query(query);
        },
        {
            maxAttempts: 5,
            delay: 1000,
            factor: 2,
        }
    )) as QueryResult;

    if (result.totalSize === 0 || !result.records || result.records.length === 0) {
        throw new Error(`no records found for ${query}`);
    }
    if (result.totalSize > 1) {
        if (returnChoices) {
            throw new Error(
                `multiple records found: ${result.records.map((record) => record[choiceField] as string).join(',')}`
            );
        }
        throw new Error('the query returned more than 1 record');
    }
    return result.records[0];
};

export { singleRecordQuery };
