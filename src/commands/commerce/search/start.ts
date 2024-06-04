/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { singleRecordQuery } from '../../../shared/queries';

export default class SearchIndex extends SfdxCommand {
    public static description = 'Start search indexing for a given webstore';

    public static examples = [
        `sf commerce:store:search:start -n storeName
        // Finds a store and indexes it
        `,
    ];

    protected static requiresUsername = true;

    protected static flagsConfig = {
        'store-name': flags.string({
            char: 'n',
            description: 'name of webstore to index',
            exclusive: ['store-id'],
        }),
        'store-id': flags.string({
            char: 'i',
            description: 'ID of webstore to index',
            exclusive: ['store-name'],
        }),
    };

    public async run(): Promise<AnyJson> {
        const conn = this.org.getConnection();

        if (!this.flags['store-id'] && !this.flags['store-name']) {
            throw new Error('you have to supply either --id or --name');
        }

        let webStoreId = this.flags['store-id'] as string;
        if (!webStoreId) {
            webStoreId = (
                await singleRecordQuery({
                    conn,
                    query: `select Id from WebStore where Name='${this.flags['store-name'] as string}'`,
                })
            ).Id;
        }

        this.ux.log(`Starting index for WebStore ID: ${webStoreId}`);

        const startIndexResults = await conn.request({
            method: 'POST',
            url: `${conn.baseUrl()}/commerce/management/webstores/${webStoreId}/search/indexes`,
            body: '{}',
        });

        this.ux.log(`Results: ${JSON.stringify(startIndexResults)}`);
        return startIndexResults;
    }
}
