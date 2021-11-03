/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import chalk from 'chalk';
import { AnyJson } from '@salesforce/ts-types';
import { storeFlags } from '../../../../lib/flags/commerce/store.flags';
import { filterFlags } from '../../../../lib/utils/args/flagsUtils';
import { shellJsonSfdx } from '../../../../lib/utils/shell';

Messages.importMessagesDirectory(__dirname);

const TOPIC = 'store';
const CMD = `commerce:${TOPIC}:quickstart:create`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);

export class StoreQuickstartCreate extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static description = msgs.getMessage('quickstart.create.cmdDescription');

    public static examples = [`sfdx ${CMD} --templatename 'b2c-lite-storefront'`];
    public static varargs = {
        required: false,
        validator: (name: string): void => {
            // Whitelist varargs parameter names
            if (!StoreQuickstartCreate.vargsAllowList.includes(name)) {
                const errMsg = `Invalid parameter [${name}] found`;
                const errName = 'InvalidVarargName';
                const errAction = `Choose one of these parameter names: ${StoreQuickstartCreate.vargsAllowList.join()}`;
                throw new SfdxError(errMsg, errName, [errAction]);
            }
        },
    };
    public static get vargsAllowList(): string[] {
        return ['urlpathprefix', 'description'];
    }

    protected static flagsConfig = {
        ...filterFlags(['templatename', 'store-name'], storeFlags),
    };

    public org: Org;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async run(): Promise<AnyJson> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { quickstartCreateSuccess: this.createCommunity() };
    }

    // eslint-disable-next-line
    private createCommunity(unique = ''): any {
        this.ux.log(
            msgs.getMessage('quickstart.create.creatingNewStoreInQueUpTo10Minutes') +
                msgs.getMessage('quickstart.create.storeName', [this.flags['store-name']]) +
                msgs.getMessage('quickstart.create.orgUsername', [this.org.getUsername()]) +
                '\n' +
                msgs.getMessage('quickstart.create.cmdDescription')
        );
        this.ux.startSpinner(msgs.getMessage('quickstart.create.creatingCommunity'));
        let output;
        const urlPathPrefix = ((this.flags['store-name'] as string) + unique).replace(/[\\W_]+/g, '');
        try {
            this.ux.setSpinnerStatus(
                msgs.getMessage('quickstart.create.creatingWith', ['sfdx force:community:create'])
            );
            // TODO make urlpathprefix and description a vararg
            // TODO make a community create object to avoid any
            output = shellJsonSfdx(
                `sfdx force:community:create -u "${this.org.getUsername()}"` +
                    ` --name "${this.flags['store-name'] as string}" ` +
                    `--templatename "${this.flags.templatename as string}" ` +
                    `--urlpathprefix "${urlPathPrefix}" ` +
                    '--description "' + // TODO allow this to be optionaly passed in varargs along with above
                    msgs.getMessage('quickstart.create.storeCreatedByQuickStartScript', [this.flags['store-name']]) +
                    '" --json'
            );
        } catch (e) {
            this.ux.stopSpinner(chalk.red(msgs.getMessage('quickstart.create.failed')));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (e.message.indexOf('Please enter a unique one') >= 0)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return this.createCommunity((Math.random() * 1e5).toString().substr(0, 5));
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.ux.log(chalk.red(JSON.stringify(JSON.parse(e.message)['message'], null, 4)));
            } catch (ee) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.ux.log(chalk.red(JSON.stringify(e.message, null, 4)));
            }
            const filteredMessages = [
                msgs.getMessage('quickstart.create.enterDifferentNameExists'),
                msgs.getMessage('quickstart.create.creatingYourCommunity'),
                msgs.getMessage('quickstart.create.createdByQuickStartScript'),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            ].filter((allowedMessage) => e.message.indexOf(allowedMessage) >= 0);
            if (filteredMessages.length === 0)
                throw new SfdxError(
                    msgs.getMessage('quickstart.create.unknownError') + JSON.stringify(output, null, 4)
                );
        }
        this.ux.stopSpinner(msgs.getMessage('quickstart.create.done'));
        if (!output) output = {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        output['urlpathprefix'] = urlPathPrefix;
        if (output) this.ux.log(JSON.stringify(output, null, 4));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return output;
    }
}
