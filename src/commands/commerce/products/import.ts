/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { fs, Messages, Org, SfdxError } from '@salesforce/core';
import chalk from 'chalk';
import { AnyJson } from '@salesforce/ts-types';
import { JsonCollection } from '@salesforce/ts-types/lib/types/json';
import { productsFlags } from '../../../lib/flags/commerce/products.flags';
import { storeFlags } from '../../../lib/flags/commerce/store.flags';
import { addAllowedArgs, filterFlags, modifyArgFlag } from '../../../lib/utils/args/flagsUtils';
import { BASE_DIR, FILE_COPY_ARGS, JSON_DIR, STORE_DIR } from '../../../lib/utils/constants/properties';
import { ImportResult, parseStoreScratchDef, replaceErrors } from '../../../lib/utils/jsonUtils';
import { forceDataRecordCreate, forceDataSoql } from '../../../lib/utils/sfdx/forceDataSoql';
import { shellJsonSfdx } from '../../../lib/utils/shell';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { StoreCreate } from '../store/create';
import { exampleFlags } from '../../../lib/flags/commerce/convert.flags';
import { FilesCopy } from '../files/copy';
import { filesFlags } from '../../../lib/flags/commerce/files.flags';
import { getDefinitionFile } from '../../../lib/utils/definitionFile';
import { appendCommonFlags, setApiVersion } from '../../../lib/utils/args/flagsUtils';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'products';
const CMD = `commerce:${TOPIC}:import`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);
const WEBSTORE_ID = '${WEBSTORE_ID}';
const PRODUCT_IMPORT_API_PATH = `commerce/management/webstores/${WEBSTORE_ID}/product-import`;

export class ProductsImport extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static readonly requiresDevhubUsername = true;
    public static description = msgs.getMessage('import.cmdDescription');

    public static examples = [`sfdx ${CMD} --store-name test-store`];
    protected static flagsConfig = {
        ...productsFlags,
        ...filterFlags(['definitionfile', 'type'], exampleFlags),
        ...filterFlags(['store-name'], storeFlags),
        ...filterFlags(['prompt'], filesFlags),
    };

    public org: Org;
    private devHubUsername: string;
    private storeDir;
    private statusFileManager: StatusFileManager;

    // tslint:disable-next-line:no-any
    public async run(): Promise<AnyJson> {
        await setApiVersion(this.org, this.flags);
        // Copy all example files
        FILE_COPY_ARGS.forEach((v) => modifyArgFlag(v.args, v.value, this.argv));
        await FilesCopy.run(addAllowedArgs(this.argv, FilesCopy), this.config);
        this.devHubUsername = (await this.org.getDevHubOrg()).getUsername();
        this.statusFileManager = new StatusFileManager(
            this.devHubUsername,
            this.org.getUsername(),
            this.flags['store-name'] as string
        );
        this.storeDir = STORE_DIR(BASE_DIR, this.devHubUsername, this.org.getUsername(), this.flags['store-name']);
        // TODO figure out what is a prerequisite to run this script
        this.ux.log(chalk.green(msgs.getMessage('import.importingProducts')));
        if (this.flags.definitionfile) {
            this.flags.definitionfile = getDefinitionFile(this.flags);
            const def = parseStoreScratchDef(this.flags);
            const out = [];
            if (def.settings && def.settings.productImport && def.settings.productImport.length > 0)
                for (const f of def.settings.productImport) out.push(await this.importProducts(f));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return { buyerGroupName: out[0] as string };
        } else return { buyerGroupName: await this.importProducts(this.flags['products-file-csv']) };
    }

    public async importProducts(productFileCsv: string): Promise<string> {
        const storeId = await StoreCreate.getStoreId(this.statusFileManager, this.flags, this.ux, this.logger);
        let buyerGroupName;
        if (productFileCsv) {
            this.ux.startSpinner(msgs.getMessage('import.importingProducts'));
            this.ux.setSpinnerStatus(msgs.getMessage('import.uploading'));
            try {
                const res = shellJsonSfdx<ImportResult>(
                    appendCommonFlags(
                        `sfdx shane:data:file:upload -f ${
                            this.flags['products-file-csv'] as string
                        } -u "${this.org.getUsername()}" --json`,
                        this.flags,
                        this.logger
                    )
                );
                this.ux.setSpinnerStatus(
                    msgs.getMessage('import.uploadedStringWithResult', [this.flags['products-file-csv']]) +
                        JSON.stringify(res)
                );
                const importFileId = res.result.Id;
                if (!importFileId) throw new SfdxError(msgs.getMessage('import.somethingWentWrongNoImportFileId')); // maybe just do product less import if this fails
                this.ux.setSpinnerStatus(
                    msgs.getMessage('import.importingProductsImportFileIdAndStoreId', [importFileId, storeId])
                );
                try {
                    await this.importFromUploadedFile(importFileId, storeId);
                } catch (e) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                    if (e.message.indexOf('UniqueConstraintViolationException') < 0) {
                        await this.statusFileManager.setValue(
                            'productsImported',
                            JSON.parse(JSON.stringify(e, replaceErrors))
                        );
                        throw e;
                    }
                }
                this.ux.stopSpinner(msgs.getMessage('import.doneImportingProductsRes') + JSON.stringify(res));
                if (res.name === 'ERRORED') {
                    // this doesn't do anything because i'm not catching the exception... but do i want to?
                    this.ux.log(
                        chalk.red.bold(
                            msgs.getMessage('import.failedToImportProductsStringDoingProductlessImport', [
                                JSON.stringify(res, null, 4),
                            ])
                        )
                    );
                    buyerGroupName = this.productLessImport();
                } else
                    buyerGroupName = forceDataSoql(
                        `SELECT name FROM BuyerGroup where name = '${
                            this.flags['store-name'] as string
                        } Buyer Group' LIMIT 1`,
                        this.org.getUsername(),
                        this.flags,
                        this.logger
                    ).result.records[0].Name;
            } catch (e) {
                await this.statusFileManager.setValue('productsImported', JSON.parse(JSON.stringify(e, replaceErrors)));
                throw e;
            }
        } else buyerGroupName = await this.productLessImport();
        if (!buyerGroupName) {
            await this.statusFileManager.setValue('productsImported', msgs.getMessage('import.failedNoBuyerGroupName'));
            throw new SfdxError(msgs.getMessage('import.somethingWentWrongNoBuyerGroupName '));
        }
        return buyerGroupName as string;
    }

    public async productLessImport(): Promise<string> {
        this.ux.log(msgs.getMessage('import.doingProductlessImport'));
        const storeId = await StoreCreate.getStoreId(this.statusFileManager, this.flags, this.ux, this.logger);
        const templates = ['WebStorePricebooks', 'WebStoreCatalogs', 'WebStoreBuyerGroups'];
        templates.forEach((f) =>
            fs.writeFileSync(
                JSON_DIR(this.storeDir) + `/${f}.json`,
                fs
                    .readFileSync(JSON_DIR() + `/${f}-template.json`)
                    .toString()
                    .replace('PutWebStoreIdHere', storeId)
            )
        );
        this.ux.log(msgs.getMessage('import.getStandardPricebooksForStoreReplaceJsonFiles'));
        const pricebook1 = forceDataSoql(
            "SELECT Id FROM Pricebook2 WHERE Name='Standard Price Book' AND IsStandard=true LIMIT 1",
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0].Id;
        fs.writeFileSync(
            JSON_DIR(this.storeDir) + '/PricebookEntrys.json',
            fs
                .readFileSync(JSON_DIR() + '/PricebookEntrys-template.json')
                .toString()
                .replace('PutStandardPricebookHere', pricebook1)
        );
        // Buyer Group
        const numberofbuyergroups = forceDataSoql(
            'SELECT COUNT(Id) FROM BuyerGroup',
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0]['expr0'] as number;
        const newNumber = numberofbuyergroups + 1;
        const newbuyergroupname = `BUYERGROUP_FROM_QUICKSTART_${newNumber}`;
        fs.writeFileSync(
            JSON_DIR(this.storeDir) + 'BuyerGroups.json',
            fs
                .readFileSync(JSON_DIR() + '/BuyerGroups-template.json')
                .toString()
                .replace('PutBuyerGroupHere', newbuyergroupname)
                .replace('PutStoreNameHere', this.flags['store-name'])
        );
        // Determine if Product-less insert or Product ins ert is needed.
        // For now, if there is at least 1 match, skip inser ting products.
        // Down the line, explore Bulk Upsert if people de lete Products.
        // Workaround, use throwaway community to delete all products to trigger re-insert.
        const productq = forceDataSoql(
            "SELECT COUNT(Id) FROM Product2 WHERE StockKeepingUnit In ('B-C-COFMAC-001', 'DRW-1', 'SS-DR-BB', 'ESP-001', 'TM-COFMAC-001', 'ESP-IOT-1', 'ID-PEM', 'TR-COFMAC-001', 'LRW-1', 'MRC-1', 'CP-2', 'GDG-1', 'E-ESP-001', 'ID-CAP-II', 'PS-DB', 'Q85YQ2', 'CCG-1', 'CERCG-1', 'CF-1', 'E-MR-B', 'ID-CAP-III', 'PS-EL', 'EM-ESP-001', 'CP-3', 'CL-DR-BB', 'CR-DEC', 'CREV-DR-BLEND', 'CM-MSB-300', 'COF-FIL', 'CP-1')",
            this.org.getUsername(),
            this.flags,
            this.logger
        ).result.records[0]['expr0'] as number;
        if (productq > 0) {
            // Grab Product IDs to create Product Entitlements
            const products = forceDataSoql(
                "SELECT Id FROM Product2 WHERE StockKeepingUnit In ('B-C-COFMAC-001', 'DRW-1', 'SS-DR-BB', 'ESP-001', 'TM-COFMAC-001', 'ESP-IOT-1', 'ID-PEM', 'TR-COFMAC-001', 'LRW-1', 'MRC-1', 'CP-2', 'GDG-1', 'E-ESP-001', 'ID-CAP-II', 'PS-DB', 'Q85YQ2', 'CCG-1', 'CERCG-1', 'CF-1', 'E-MR-B', 'ID-CAP-III', 'PS-EL', 'EM-ESP-001', 'CP-3', 'CL-DR-BB', 'CR-DEC', 'CREV-DR-BLEND', 'CM-MSB-300', 'COF-FIL', 'CP-1')",
                this.org.getUsername(),
                this.flags,
                this.logger
            ).result.records; // [0].Id
            // Load Product IDs into array
            const productArray = products.map((row) => row.Id); // figur e this out
            // Import Productless data
            try {
                shellJsonSfdx(
                    appendCommonFlags(
                        `sfdx force:data:tree:import -u "${this.org.getUsername()}" -p ${JSON_DIR(
                            this.storeDir
                        )}/Productless-Plan-1.json`,
                        this.flags,
                        this.logger
                    )
                );
            } catch (e) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                if (e.message.indexOf('LIMIT_EXCEEDED') < 0 && e.message.indexOf('DUPLICATE_VALUE') < 0) throw e;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.ux.log(JSON.parse(e.message).err);
            }
            // Get newly created Entitlement Policy ID
            const policyID = forceDataSoql(
                'SELECT Id FROM CommerceEntitlementPolicy ORDER BY CreatedDate Desc LIMIT 1',
                this.org.getUsername(),
                this.flags,
                this.logger
            ).result.records[0].Id;
            // Create new Product Entitlement records
            productArray.forEach((product) =>
                this.ux.log(
                    JSON.stringify(
                        forceDataRecordCreate(
                            'CommerceEntitlementProduct',
                            `PolicyId='${policyID}' ProductId='${product}'`,
                            this.org.getUsername(),
                            this.flags,
                            this.logger
                        )
                    )
                )
            );
            // Add Store Catalog mapping
            const catalogId = forceDataSoql(
                "SELECT Id FROM ProductCatalog WHERE Name='CATALOG_FROM_QUICKSTART' ORDER BY CreatedDate Desc LIMIT 1",
                this.org.getUsername(),
                this.flags,
                this.logger
            ).result.records[0].Id;
            forceDataRecordCreate(
                'WebStoreCatalog',
                `ProductCatalogId='${catalogId}' SalesStoreId='${storeId}'`,
                this.org.getUsername(),
                this.flags,
                this.logger
            );
            // Add Store Pricebook mapping
            const pricebook2Id = forceDataSoql(
                "SELECT Id FROM Pricebook2 WHERE Name='BASIC_PRICEBOOK_FROM_QUICKSTART' ORDER BY CreatedDate Desc LIMIT 1",
                this.org.getUsername(),
                this.flags,
                this.logger
            ).result.records[0].Id;
            forceDataRecordCreate(
                'WebStorePricebook',
                `IsActive=true Pricebook2Id='${pricebook2Id}' WebStoreId='${storeId}'`,
                this.org.getUsername(),
                this.flags,
                this.logger
            );
            // Add Buyer Group Pricebook mapping
            const buyergroupId = forceDataSoql(
                `SELECT Id FROM BuyerGroup WHERE Name='${newbuyergroupname}' LIMIT 1`,
                this.org.getUsername(),
                this.flags,
                this.logger
            ).result.records[0].Id;
            forceDataRecordCreate(
                'BuyerGroupPricebook',
                `Pricebook2Id='${pricebook2Id}' BuyerGroupId='${buyergroupId}'`,
                this.org.getUsername(),
                this.flags,
                this.logger
            );
        } // Import files
        else
            try {
                shellJsonSfdx(
                    appendCommonFlags(
                        `sfdx force:data:tree:import -u "${this.org.getUsername()}" -p ${JSON_DIR(
                            this.storeDir
                        )}/Plan-1.json`,
                        this.flags,
                        this.logger
                    )
                );
            } catch (e) {
                if (JSON.stringify(e).indexOf(msgs.getMessage('import.alreadyExists')) < 0) throw e;
                this.ux.log(msgs.getMessage('import.productWithSKUAlreadyExists'));
            }
        const productList = [
            'WebStorePricebooks',
            'WebStoreCatalogs',
            'WebStoreBuyerGroups',
            'BuyerGroups',
            'PricebookEntrys',
        ];
        productList.forEach((file) => fs.removeSync(JSON_DIR(this.storeDir) + `/${file}.json`));
        // Return BuyerGroup Name to be used in BuyerGroup Account mapping
        return newbuyergroupname;
    }

    public async importFromUploadedFile(contentVersionId: string, webStoreId: string): Promise<JsonCollection> {
        const conn = this.org.getConnection();
        const url = `${conn.baseUrl()}/${PRODUCT_IMPORT_API_PATH.replace(WEBSTORE_ID, webStoreId)}`;

        this.ux.log(`Starting import for WebStore ID: ${webStoreId} to ${url}`);

        return await conn.request({
            method: 'POST',
            url,
            body: `{
                "importConfiguration": {
                    "importSource": {
                        "contentVersionId": "${contentVersionId}"
                    }
                }
            }`,
            headers: {
                key: 'Content-Type',
                type: 'text',
                value: 'application/json',
            },
        });
    }
}
