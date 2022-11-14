/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand, flags } from '@salesforce/command';
import { fs, Messages, SfdxError } from '@salesforce/core';
import chalk from 'chalk';
import { AnyJson } from '@salesforce/ts-types';
import { addAllowedArgs, modifyArgFlag } from '../../../lib/utils/args/flagsUtils';
import { BASE_DIR, CONFIG_DIR, FILE_COPY_ARGS, DEVHUB_DIR } from '../../../lib/utils/constants/properties';
import { replaceErrors, SfdxProject } from '../../../lib/utils/jsonUtils';
import { getScratchOrgByUsername } from '../../../lib/utils/sfdx/forceOrgList';
import { shellJsonSfdx } from '../../../lib/utils/shell';
import { sleep } from '../../../lib/utils/sleep';
import { StatusFileManager } from '../../../lib/utils/statusFileManager';
import { FilesCopy } from '../files/copy';
import { mkdirSync } from '../../../lib/utils/fsUtils';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'scratchorg';
const CMD = `commerce:${TOPIC}:create`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class ScratchOrgCreate extends SfdxCommand {
    public static readonly requiresDevhubUsername = true;
    public static description = msgs.getMessage('create.cmdDescription');
    public static examples = [`sfdx ${CMD} --username demo@1commerce.com --targetdevhubusername ceo@mydevhub.com`];

    protected static flagsConfig = {
        username: flags.string({
            char: 'u',
            description: msgs.getMessage('createFlags.scratchOrgAdminUsernameDescription'),
        }),
        alias: flags.string({
            char: 'a',
            description: msgs.getMessage('createFlags.scratchOrgAliasDescription'),
        }),
        type: flags.string({
            char: 't',
            default: 'both',
            description: 'b2b, b2c or both',
        }),
        wait: flags.number({
            char: 'w',
            description: msgs.getMessage('createFlags.wait'),
            default: 15,
        }),
        prompt: flags.boolean({
            char: 'y',
            default: false,
            description: 'If there is a file difference detected, prompt before overwriting file',
        }),
    };
    public statusManager: StatusFileManager;
    private devHubDir: string;
    private devhubUsername: string;

    public async run(): Promise<AnyJson> {
        /*
        Base class reads the tagetdevhubusername or -v arg. if not provided it will use whatever is set for defaultdevhubusername config parameter
         */
        this.devhubUsername = this.hubOrg.getUsername();
        await this.copyConfigFiles();
        this.statusManager = new StatusFileManager(this.devhubUsername, this.flags.username);
        this.ux.log(msgs.getMessage('create.usingScratchOrgAdmin', [this.flags.username]));

        const sfdxProject: SfdxProject = Object.assign(
            new SfdxProject(),
            fs.readJsonSync(BASE_DIR + '/sfdx-project.json')
        );
        if (!this.flags.apiversion) {
            this.flags.apiversion = sfdxProject.sourceApiVersion;
        } else {
            sfdxProject.sourceApiVersion = this.flags.apiversion as string;
        }
        this.devHubDir = DEVHUB_DIR(BASE_DIR, this.devhubUsername);
        const sfdxProjectFile = mkdirSync(this.devHubDir) + '/sfdx-project.json';
        fs.writeFileSync(sfdxProjectFile, JSON.stringify(sfdxProject, null, 4));

        await this.createScratchOrg();
        this.ux.log(chalk.green.bold(msgs.getMessage('create.completedCreatingScratchOrg')));
        this.ux.log(
            chalk.green.bold(msgs.getMessage('create.allDoneProceedCreatingNewStore', ['commerce:store:create']))
        );
        return { scratchOrgCreated: true };
    }

    public async createScratchOrg(cnt = 0): Promise<void> {
        if ((await this.statusManager.getScratchOrgValue('created')) === 'true') return;
        const scratchOrg = getScratchOrgByUsername(this.flags.username);
        if (scratchOrg) {
            await this.statusManager.setScratchOrgValue('created', true);
            return;
        }
        this.ux.log(msgs.getMessage('create.preparingResourcesEtc'));
        this.ux.log(
            msgs.getMessage('create.creatingNewScratchOrgInfo') +
                msgs.getMessage('create.apiVersion', [this.flags.apiversion]) +
                msgs.getMessage('create.devhubUsername', [this.devhubUsername]) +
                msgs.getMessage('create.scratchOrgAdminUsername', [this.flags.username]) +
                msgs.getMessage('create.thisMayTakeAFewMins')
        );
        const orgType = (this.flags.type as string).toLowerCase();
        this.ux.log(`${CONFIG_DIR}/${orgType}-project-scratch-def.json`);
        this.ux.startSpinner(msgs.getMessage('create.creatingNewScratchOrg'));
        try {
            this.ux.setSpinnerStatus(msgs.getMessage('create.using', ['sfdx force:org:create']));
            mkdirSync((this.devHubDir ? this.devHubDir : BASE_DIR) + '/force-app');
            const cmd = `sfdx force:org:create \
--targetdevhubusername="${this.devhubUsername}" \
--definitionfile=${CONFIG_DIR}/${orgType}-project-scratch-def.json \
--apiversion="${this.flags.apiversion as string}" \
--setalias="${this.flags.alias as string}" \
--durationdays=30 \
--wait=${this.flags.wait as number} \
username="${this.flags.username as string}" \
--setdefaultusername \
--json`;

            const res = shellJsonSfdx(cmd, null, this.devHubDir ? this.devHubDir : '/tmp');

            this.ux.setSpinnerStatus(chalk.green(JSON.stringify(res)));
            await this.statusManager.setScratchOrgValue('created', true);
            this.ux.stopSpinner(msgs.getMessage('create.successfulOrgCreation'));
        } catch (e) {
            this.ux.stopSpinner(msgs.getMessage('create.failureOrgCreation'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.ux.log(JSON.stringify(e.message, null, 4));
            if (cnt > 3) {
                await this.statusManager.setScratchOrgValue('created', JSON.parse(JSON.stringify(e, replaceErrors)));
                throw e;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (e.message.indexOf('MyDomainResolverTimeoutError') >= 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.ux.log(JSON.stringify(e.message, null, 4));
                this.ux.startSpinner(msgs.getMessage('create.sleepingBeforeCheckingIfOrgIsCreated'));
                let count = 0;
                while (!getScratchOrgByUsername(this.flags.username)) {
                    await sleep(10 * 1000);
                    if (count++ > 60) {
                        await this.statusManager.setScratchOrgValue(
                            'created',
                            JSON.parse(JSON.stringify(e, replaceErrors))
                        );
                        throw new SfdxError(msgs.getMessage('create.waitedTimeStillNoOrgCreated', ['10 minutes']));
                    }
                }
                this.ux.stopSpinner(msgs.getMessage('create.scratchOrgNowExists'));
                throw e;
            } else {
                let message;
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                    message = JSON.parse(e.message);
                } catch (ee) {
                    await this.statusManager.setScratchOrgValue(
                        'created',
                        JSON.parse(JSON.stringify(e, replaceErrors))
                    );
                    throw e;
                }
                if (
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    message.name === 'RemoteOrgSignupFailed' &&
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                    message.message.indexOf(msgs.getMessage('create.pleaseTryAgain')) >= 0
                )
                    await this.createScratchOrg(++cnt);
                else {
                    await this.statusManager.setScratchOrgValue(
                        'created',
                        JSON.parse(JSON.stringify(e, replaceErrors))
                    );
                    throw e;
                }
            }
        }
    }

    private async copyConfigFiles(): Promise<void> {
        // copy the config files
        // TODO: Copy only scratch org files
        FILE_COPY_ARGS.forEach((v) => modifyArgFlag(v.args, v.value, this.argv));
        if (this.flags.prompt) {
            this.argv.push('--prompt');
        }
        await FilesCopy.run(addAllowedArgs(this.argv, FilesCopy), this.config);
    }
}
