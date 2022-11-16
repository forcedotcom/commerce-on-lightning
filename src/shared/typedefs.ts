/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
interface Record {
    Id: string;
}

interface QueryResult {
    totalSize: number;
    done: boolean;
    records: Record[];
}

export { Record, QueryResult };
