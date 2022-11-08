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
import { Duration } from '@salesforce/kit';
import { addAllowedArgs, modifyArgFlag } from '../../../lib/utils/args/flagsUtils';
import { BASE_DIR, CONFIG_DIR, FILE_COPY_ARGS, DEVHUB_DIR } from '../../../lib/utils/constants/properties';
import { Org, replaceErrors, SfdxProject } from '../../../lib/utils/jsonUtils';
import { getOrgInfo, getScratchOrgByUsername } from '../../../lib/utils/sfdx/forceOrgList';
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
    public static readonly supportsDevhubUsername = true;
    public static readonly supportsUsername = true;
    public static description = msgs.getMessage('create.cmdDescription');
    public static examples = [
        `sfdx ${CMD} --targetusername demo@1commerce.com --targetdevhubusername ceo@mydevhub.com`,
    ];

    protected static flagsConfig = {
        alias: flags.string({
            char: 'a',
            description: msgs.getMessage('createFlags.scratchOrgAliasDescription'),
        }),
        type: flags.string({
            char: 't',
            default: 'both',
            description: 'b2b, b2c or both',
        }),
        wait: flags.minutes({
            char: 'w',
            description: msgs.getMessage('createFlags.wait'),
            min: 6,
            default: Duration.minutes(15),
        }),
        prompt: flags.boolean({
            char: 'y',
            default: false,
            description: 'If there is a file difference detected, prompt before overwriting file',
        }),
    };
    private statusManager: StatusFileManager;
    private devHubDir: string;

    public async run(): Promise<AnyJson> {
        await this.copyConfigFiles();

        this.statusManager = new StatusFileManager(this.flags.devhubUsername, this.flags['targetusername']);
        this.ux.log(msgs.getMessage('create.usingScratchOrgAdmin', [this.flags['targetusername']]));
        if (!getOrgInfo(this.flags['targetdevhubusername'] as string))
            // TODO add this as a require, ie requires devhub
            throw new SfdxError(msgs.getMessage('create.devhubSetupWasNotCompletedSuccessfully'));

        const sfdxProject: SfdxProject = Object.assign(
            new SfdxProject(),
            fs.readJsonSync(BASE_DIR + '/sfdx-project.json')
        );
        if (!this.flags.apiversion) {
            this.flags.apiversion = sfdxProject.sourceApiVersion;
        } else {
            sfdxProject.sourceApiVersion = this.flags['apiversion'] as string;
        }
        this.devHubDir = DEVHUB_DIR(BASE_DIR, this.flags['targetdevhubusername']);
        const sfdxProjectFile = mkdirSync(this.devHubDir) + '/sfdx-project.json';
        fs.writeFileSync(sfdxProjectFile, JSON.stringify(sfdxProject, null, 4));

        await this.createScratchOrg();
        this.ux.log(chalk.green.bold(msgs.getMessage('create.completedCreatingScratchOrg')));
        this.ux.log(
            chalk.green.bold(msgs.getMessage('create.allDoneProceedCreatingNewStore', ['commerce:store:create']))
        );
        return { scratchOrgCreated: true };
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

    private async getScratchOrg(): Promise<Org> {
        const scratchOrg = getScratchOrgByUsername(this.flags['username']);
        if (scratchOrg) {
            this.ux.setSpinnerStatus(msgs.getMessage('create.orgExists') + JSON.stringify(scratchOrg));
            await this.statusManager.setScratchOrgValue('created', true);
            return scratchOrg;
        }
        return null;
    }

    private async createScratchOrg(cnt = 0): Promise<void> {
        if ((await this.statusManager.getScratchOrgValue('created')) === 'true' || (await this.getScratchOrg())) return;
        this.ux.log(msgs.getMessage('create.preparingResourcesEtc'));
        this.ux.log(
            msgs.getMessage('create.creatingNewScratchOrgInfo') +
                msgs.getMessage('create.apiVersion', [this.flags['apiversion']]) +
                msgs.getMessage('create.devhubUsername', [this.flags['targetdevhubusername']]) +
                msgs.getMessage('create.scratchOrgAdminUsername', [this.flags['targetusername']]) +
                msgs.getMessage('create.thisMayTakeAFewMins')
        );
        const orgType = (this.flags.type as string).toLowerCase();
        this.ux.log(`${CONFIG_DIR}/${orgType}-project-scratch-def.json`);
        this.ux.startSpinner(msgs.getMessage('create.creatingNewScratchOrg'));
        try {
            this.ux.setSpinnerStatus(msgs.getMessage('create.using', ['sfdx force:org:create']));
            mkdirSync((this.devHubDir ? this.devHubDir : BASE_DIR) + '/force-app');
            const cmd = `sfdx force:org:create \
--targetdevhubusername="${this.flags['targetdevhubusername'] as string}" \
--definitionfile=${CONFIG_DIR}/${orgType}-project-scratch-def.json \
--apiversion="${this.flags['apiversion'] as string}" \
--setalias="${this.flags['alias'] as string}" \
--durationdays=30 \
--wait=${(this.flags['wait'] as Duration).minutes} \
username="${this.flags['targetusername'] as string}" \
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
                while (!(await this.getScratchOrg())) {
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
}
