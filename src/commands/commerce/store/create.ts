/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { fs, Logger, Messages, Org, SfdxError } from '@salesforce/core';
import chalk from 'chalk';
import { AnyJson } from '@salesforce/ts-types';
import { OutputFlags } from '@oclif/parser';
import { addAllowedArgs, appendCommonFlags, modifyArgFlag } from '../../../lib/utils/args/flagsUtils';
import {
    BASE_DIR,
    BUYER_USER_DEF,
    SCRATCH_ORG_DIR,
    STORE_DIR,
    FILE_COPY_ARGS,
} from '../../../lib/utils/constants/properties';
import { BuyerUserDef, parseStoreScratchDef, replaceErrors, UserInfo } from '../../../lib/utils/jsonUtils';
import { Requires } from '../../../lib/utils/requires';
import { forceDataSoql } from '../../../lib/utils/sfdx/forceDataSoql';
import { shell, shellJsonSfdx } from '../../../lib/utils/shell';
import { sleep } from '../../../lib/utils/sleep';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { mkdirSync } from '../../../lib/utils/fsUtils';
import { FilesCopy } from '../files/copy';
import { getDefinitionFile } from '../../../lib/utils/definitionFile';
import SearchIndex from '../search/start';
import { setApiVersion } from '../../../lib/utils/args/flagsUtils';
import { StoreQuickstartCreate } from './quickstart/create';
import { StoreQuickstartSetup } from './quickstart/setup';
import { StoreOpen } from './open';
import { StoreDisplay } from './display';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'store';
const CMD = `commerce:${TOPIC}:create`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class StoreCreate extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static readonly requiresDevhubUsername = true;
    public static varargs = {
        required: false,
        validator: (name: string): void => {
            // Whitelist varargs parameter names
            if (!StoreCreate.vargsAllowList.includes(name)) {
                const errMsg = `Invalid parameter [${name}] found`;
                const errName = 'InvalidVarargName';
                const errAction = `Choose one of these parameter names: ${StoreCreate.vargsAllowList.join()}`;
                throw new SfdxError(errMsg, errName, [errAction]);
            }
        },
    };

    public static get vargsAllowList(): string[] {
        return ['buyerEmail', 'existingBuyerAuthentication', 'buyerAlias'].concat(
            StoreQuickstartSetup.vargsAllowList,
            StoreQuickstartCreate.vargsAllowList,
            FilesCopy.vargsAllowList
        );
    }

    public static description = msgs.getMessage('create.cmdDescription');
    public static examples = [`sfdx ${CMD} --store-name test-store`];
    protected static flagsConfig = {
        'store-name': flags.string({
            char: 'n',
            default: '1commerce',
            description: msgs.getMessage('setup.storeNameDescription'),
            required: true,
        }),
        templatename: flags.string({
            char: 't',
            description: msgs.getMessage('setup.templateNameDescription'),
        }),
        definitionfile: flags.filepath({
            char: 'f',
            description: msgs.getMessage('create.configFileDescription'),
        }),
        type: flags.string({
            char: 'o',
            options: ['b2c', 'b2b'],
            parse: (input) => input.toLowerCase(),
            default: 'b2c',
            description: msgs.getMessage('create.storeTypeDescription'),
        }),
        'buyer-username': flags.string({
            char: 'b',
            default: 'buyer@1commerce.com',
            description: msgs.getMessage('setup.scratchOrgBuyerUsernameDescription'),
        }),
        prompt: flags.boolean({
            char: 'y',
            default: false,
            description: 'If there is a file difference detected, prompt before overwriting file',
        }),
    };

    public org: Org;
    private scrDef;
    private storeDir;
    private devhubUsername;
    private statusFileManager: StatusFileManager;

    public static async getStoreId(
        statusFileManager: StatusFileManager,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cmdFlags: OutputFlags<any>,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        ux,
        logger: Logger,
        cnt = 0,
        setPerms = true
    ): Promise<string> {
        let storeId = (await statusFileManager.getValue('id')) as string;
        if (storeId && storeId !== 'undefined') return storeId;
        try {
            const res = forceDataSoql(
                `SELECT Id FROM WebStore WHERE Name='${statusFileManager.storeName}' LIMIT 1`,
                statusFileManager.scratchOrgAdminUsername,
                cmdFlags,
                logger
            );
            if (!res.result.records || res.result.records.length === 0 || !res.result.records[0]) return null;
            storeId = res.result.records[0].Id;
        } catch (e) {
            /* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
            if (e.message.indexOf(msgs.getMessage('create.webStoreNotSupported')) >= 0 && setPerms) {
                if (cnt > 0) {
                    ux.log(chalk.green(msgs.getMessage('create.automaticallySettingPermFailedPleaseDoItManually')));
                    shell(
                        `sfdx force:org:open -u "${statusFileManager.scratchOrgAdminUsername}" -p /qa/hoseMyOrgPleaseSir.jsp`
                    );
                    ux.log(chalk.green(msgs.getMessage('create.pressEnterWhenPermIsSet')));
                    await ux.prompt(msgs.getMessage('create.enter'), { required: false });
                    ux.log(chalk.green(msgs.getMessage('create.assumingYouSavedThePerm')));
                    /* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
                    return await this.getStoreId(statusFileManager, cmdFlags, ux, logger, ++cnt);
                }
                // await ScratchOrgCreate.addB2CLiteAccessPerm(flags.scratchOrgAdminUsername, ux);
                return await this.getStoreId(statusFileManager, cmdFlags, ux, logger, ++cnt);
            } else throw e;
        }
        await statusFileManager.setValue('id', storeId);
        return storeId;
    }
    // does this belong here?
    public static async waitForStoreId(
        statusFileManager: StatusFileManager,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cmdFlags: OutputFlags<any>,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        ux,
        logger: Logger,
        time = 10 * 3
    ): Promise<void> {
        if (!ux || !ux.stopSpinner) {
            ux = console;
            /* eslint-disable no-console */
            ux['setSpinnerStatus'] = console.log;
            ux['stopSpinner'] = console.log;
            ux['startSpinner'] = console.log;
            /* eslint-disable no-console */
        }
        ux.setSpinnerStatus(msgs.getMessage('create.waitingForWebStoreId'));
        let count = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (await StoreCreate.getStoreId(statusFileManager, cmdFlags, ux, logger))
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return ux.stopSpinner(
                    `${msgs.getMessage('create.doneWithStoreId')} ${await StoreCreate.getStoreId(
                        statusFileManager,
                        cmdFlags,
                        ux,
                        logger
                    )}`
                );
            ux.setSpinnerStatus('Store not yet created, waiting 10 seconds...');
            await sleep(10 * 1000);
            ux.setSpinnerStatus(msgs.getMessage('create.stillWaiting'));
            if (count++ > time)
                // 5 minutes
                throw new SfdxError(msgs.getMessage('create.waited5MinNoStoreId'));
        }
    }

    public static async getUserInfo(
        statusFileManager: StatusFileManager,
        scratchOrgBuyerUsername: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cmdFlags: OutputFlags<any>,
        logger: Logger
    ): Promise<UserInfo> {
        if (await statusFileManager.getValue('userInfo')) {
            const userInfo = Object.assign(new UserInfo(), await statusFileManager.getValue('userInfo'));
            if (userInfo && userInfo.id) return userInfo;
        }
        try {
            const output = shellJsonSfdx(
                appendCommonFlags(
                    `sfdx force:user:display -u "${scratchOrgBuyerUsername}" ${
                        statusFileManager.devhubAdminUsername
                            ? '-v "' + statusFileManager.devhubAdminUsername + '"'
                            : ''
                    } --json`,
                    cmdFlags,
                    logger
                )
            );
            console.log(JSON.stringify(output));
            await statusFileManager.setValue('userInfo', output.result);
            return Object.assign(new UserInfo(), output.result);
        } catch (e) {
            console.log(JSON.parse(JSON.stringify(e, replaceErrors)));
        }
    }
    public async run(): Promise<AnyJson> {
        this.devhubUsername = (await this.org.getDevHubOrg()).getUsername();
        await setApiVersion(this.org, this.flags);
        // Copy all example files
        FILE_COPY_ARGS.forEach((v) => modifyArgFlag(v.args, v.value, this.argv));
        await FilesCopy.run(addAllowedArgs(this.argv, FilesCopy), this.config);
        if (!this.flags.type || (this.flags.type !== 'b2c' && this.flags.type !== 'b2b')) this.flags.type = 'b2c';
        this.flags.definitionfile = getDefinitionFile(this.flags);
        this.scrDef = parseStoreScratchDef(this.flags);
        // parseStoreScratchDef overrides scrDef with arg flag values, below is needed when none are supplied so we use the values in store def file
        const modifyArgs = [
            { args: ['-n', '--store-name'], value: this.scrDef.storeName as string },
            { args: ['-t', '--templatename'], value: this.scrDef.template as string },
        ];
        modifyArgs.forEach((v) => modifyArgFlag(v.args, v.value, this.argv));
        this.statusFileManager = new StatusFileManager(
            this.devhubUsername,
            this.org.getUsername(),
            this.scrDef.storeName
        );
        this.storeDir = STORE_DIR(BASE_DIR, this.devhubUsername, this.org.getUsername(), this.scrDef.storeName); // TODO keep steps with status file and config but decouple them from this plugin add it to orchestration plugin
        if (await this.statusFileManager.getValue('done')) {
            this.ux.log(msgs.getMessage('create.statusIndicatesCompletedSkipping'));
            return { createdStore: true };
        }
        this.ux.log(
            msgs.getMessage('create.messageIntentToCreateInfo', [
                this.org.getUsername(),
                this.flags['buyer-username'],
                this.scrDef.template,
                this.scrDef.storeName,
            ])
        );
        if (!this.varargs['buyerAlias']) this.varargs['buyerAlias'] = 'buyer';
        if (
            !this.varargs['buyerEmail'] ||
            (this.varargs['buyerEmail'] as string).indexOf('scratchOrgBuyerUsername.replace') >= 0
        ) {
            let buyerEmail = os.userInfo().username + '+' + (this.flags['buyer-username'] as string);
            buyerEmail = buyerEmail.replaceAll('@', 'AT') + '@salesforce.com';
            this.varargs['buyerEmail'] = buyerEmail;
        }

        if (!this.varargs['existingBuyerAuthentication'])
            this.varargs['existingBuyerAuthentication'] = `${os.homedir()}/.sfdx/${
                this.flags['buyer-username'] as string
            }.json`;
        this.ux.log(
            msgs.getMessage('create.removingSfdxAuthFile', [this.varargs['existingBuyerAuthentication'] as string])
        );
        try {
            fs.removeSync(this.varargs['existingBuyerAuthentication'] as string);
        } catch (e) {
            /* Don't care if it doesn't exist*/
        }
        const buyerUserDefTemplate = new BuyerUserDef();
        buyerUserDefTemplate.username = this.flags['buyer-username'] as string;
        buyerUserDefTemplate.email = this.varargs['buyerEmail'] as string;
        buyerUserDefTemplate.alias = (this.varargs['buyerAlias'] as string) || 'buyer';
        buyerUserDefTemplate.profileName =
            buyerUserDefTemplate.profileName + ((this.flags.type as string) === 'b2b' ? '_B2B' : '');
        fs.writeFileSync(BUYER_USER_DEF(this.storeDir), JSON.stringify(buyerUserDefTemplate, null, 4));
        await this.createCommunity();
        this.ux.log(chalk.green.bold(msgs.getMessage('create.completedStep6')));
        this.ux.log(msgs.getMessage('create.communityNowAvailable'));
        await this.pushStoreSources();
        this.ux.log(chalk.green.bold(msgs.getMessage('create.completedStep7')));
        await this.assignShopperProfileToBuyerUser();
        this.ux.log(chalk.green.bold(msgs.getMessage('create.completedStep8')));
        await this.createSearchIndex();
        this.ux.log(msgs.getMessage('create.openingBrowserTheStoreAdminPage'));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res = await StoreOpen.run(addAllowedArgs(this.argv, StoreOpen), this.config);
        if (!res) return;
        this.ux.log(chalk.green.bold(msgs.getMessage('create.allDone'))); // don't delete the status file here. Status file deleted with reset.
        await StoreDisplay.run(addAllowedArgs(this.argv, StoreDisplay), this.config);
        await this.statusFileManager.setValue('done', true);
        return { createdStore: true };
    }

    private async createCommunity(cnt = 0): Promise<void> {
        try {
            if (await StoreCreate.getStoreId(this.statusFileManager, this.flags, this.ux, this.logger, 0, false))
                return;
        } catch (e) {
            /* Expect exception here if store hasn't been created yet*/
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res = await StoreQuickstartCreate.run(addAllowedArgs(this.argv, StoreQuickstartCreate), this.config);
        if (!res) throw new SfdxError(msgs.getMessage('create.errorStoreQuickstartCreateFailed'));
        this.ux.startSpinner(msgs.getMessage('create.waitingForCommunity'));
        try {
            await StoreCreate.waitForStoreId(this.statusFileManager, this.flags, this.ux, this.logger, 2);
        } catch (e) {
            if (cnt > 10) {
                await this.statusFileManager.setValue('id', JSON.parse(JSON.stringify(e, replaceErrors)));
                throw e;
            }
            this.ux.setSpinnerStatus(msgs.getMessage('create.communityStillNotAvailableCount', [cnt]));
            await this.createCommunity(++cnt);
        }
        this.ux.stopSpinner(msgs.getMessage('create.communityNowAvailable'));
        await this.statusFileManager.setValue('urlpathprefix', res['quickstartCreateSuccess']['urlpathprefix']);
    }

    private async pushStoreSources(): Promise<void> {
        if ((await this.statusFileManager.getValue('pushedSources')) === 'true') return;
        const scratchOrgDir = mkdirSync(SCRATCH_ORG_DIR(BASE_DIR, this.devhubUsername, this.org.getUsername()));
        try {
            fs.removeSync(scratchOrgDir + '/force-app');
        } catch (e) {
            /* IGNORE */
        }
        const req = new Requires();
        await req
            .examplesConverted(
                scratchOrgDir,
                this.scrDef.storeName,
                this.flags.type,
                this.flags.definitionfile,
                this.flags.apiversion
            )
            .build();
        this.ux.startSpinner(msgs.getMessage('create.pushingStoreSources'));
        try {
            this.ux.setSpinnerStatus(msgs.getMessage('create.using', ['sfdx force:source:push']));
            shellJsonSfdx(
                appendCommonFlags(
                    `cd ${scratchOrgDir} && echo y | sfdx force:source:tracking:clear -u "${this.org.getUsername()}"`,
                    this.flags,
                    this.logger
                )
            );
            shellJsonSfdx(
                appendCommonFlags(
                    `cd ${scratchOrgDir} && sfdx force:source:push -f -u "${this.org.getUsername()}"`,
                    this.flags,
                    this.logger
                )
            );
        } catch (e) {
            if (e.message && JSON.stringify(e.message).indexOf(msgs.getMessage('create.checkInvalidSession')) >= 0) {
                this.ux.log(msgs.getMessage('create.preMessageOpeningPageSessinonRefresh', [e.message]));
                shell('sfdx force:org:open -u ' + this.org.getUsername()); // todo might puppet this
                shellJsonSfdx(
                    appendCommonFlags(
                        `cd ${scratchOrgDir} && sfdx force:source:push -f -u "${this.org.getUsername()}"`,
                        this.flags,
                        this.logger
                    )
                );
            } else {
                await this.statusFileManager.setValue('pushedSources', JSON.parse(JSON.stringify(e, replaceErrors)));
                throw e;
            }
        }
        this.ux.stopSpinner(msgs.getMessage('create.done'));
        this.ux.log(
            msgs.getMessage('create.settingUpStoreBuyerCreateBuyerWithInfo', [
                this.flags['buyer-username'],
                this.varargs['buyerEmail'],
                this.varargs['buyerAlias'],
            ])
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res = await StoreQuickstartSetup.run(addAllowedArgs(this.argv, StoreQuickstartSetup), this.config); // don't use spinner for calling other commands
        if (!res) throw new SfdxError(msgs.getMessage('create.errorStoreQuickstartSetupFailed'));
        this.ux.log(msgs.getMessage('create.done'));
        await this.statusFileManager.setValue('pushedSources', true);
    }

    private async assignShopperProfileToBuyerUser(): Promise<void> {
        let userInfo;
        if ((await this.statusFileManager.getValue('assignedShopperProfileToBuyerUser')) === 'true')
            if (!(await this.statusFileManager.getValue('userInfo')))
                try {
                    userInfo = StoreCreate.getUserInfo(
                        this.statusFileManager,
                        this.flags['buyer-username'],
                        this.flags,
                        this.logger
                    );
                    if (userInfo) return await this.statusFileManager.setValue('userInfo', userInfo);
                } catch (e) {
                    /* DO nothing it creates it below */
                }
            else return;
        this.ux.log(msgs.getMessage('create.assigningShopperProfileToBuyer'));
        shell(
            appendCommonFlags(
                'sfdx force:user:permset:assign --permsetname CommerceUser ' +
                    `--targetusername "${this.org.getUsername()}"  --onbehalfof "${
                        this.flags['buyer-username'] as string
                    }"`,
                this.flags,
                this.logger
            )
        );
        this.ux.log(msgs.getMessage('create.changingPasswordForBuyer'));
        try {
            shellJsonSfdx(
                appendCommonFlags(
                    `sfdx force:user:password:generate -u "${this.org.getUsername()}" -o "${
                        this.flags['buyer-username'] as string
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    }" -v "${this.devhubUsername}"`,
                    this.flags,
                    this.logger
                )
            );
        } catch (e) {
            if (e.message.indexOf('INSUFFICIENT_ACCESS') < 0) {
                await this.statusFileManager.setValue('userInfo', JSON.parse(JSON.stringify(e, replaceErrors)));
                throw e;
            }
            this.ux.log(chalk.red.bold(JSON.parse(e.message).message));
        }
        userInfo = await StoreCreate.getUserInfo(
            this.statusFileManager,
            this.flags['buyer-username'],
            this.flags,
            this.logger
        );
        await this.statusFileManager.setValue('userInfo', userInfo);
    }

    private async createSearchIndex(): Promise<void> {
        if ((await this.statusFileManager.getValue('indexCreated')) === 'true') return;
        this.ux.log(msgs.getMessage('create.createSearchIndexInfo'));
        await SearchIndex.run(addAllowedArgs(this.argv, SearchIndex), this.config);
        // TODO check if index was created successfully, all i can do is assume it was
        await this.statusFileManager.setValue('indexCreated', true);
    }
}
