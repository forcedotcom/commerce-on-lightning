/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execSync, spawn, StdioOptions } from 'child_process';
import { Messages, SfdxError } from '@salesforce/core';
import parseArgsStringToArgv from 'string-argv';
import { BASE_DIR } from './constants/properties';
import { Result } from './jsonUtils';
import { sleep } from './sleep';

Messages.importMessagesDirectory(__dirname);
const msgs = Messages.loadMessages('@salesforce/commerce', 'commerce');
/* eslint-disable */
if (!Object.entries)
    Object.entries = (obj) => {
        const ownProps = Object.keys(obj);
        let i = ownProps.length;
        const resArray = new Array(i); // preallocate the Array
        while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

        return resArray;
    };
if (!Object.fromEntries)
    Object.fromEntries = (entries) => {
        if (!entries || !entries[Symbol.iterator])
            throw new Error('Object.fromEntries() requires a single iterable argument');
        const obj = {};
        for (const [key, value] of entries) obj[key] = value;
        return obj;
    };
/* eslint-disable */

const excludeEnvs = ['SFDX_NPM_REGISTRY', 'SFDX_S3_HOST'];
const envs = {
    ...Object.fromEntries(Object.entries(process.env).filter((k) => excludeEnvs.indexOf(k[0]) < 0)),
    NODE_TLS_REJECT_UNAUTHORIZED: '0',
    SFDX_REST_DEPLOY: 'false',
    NODE_NO_WARNINGS: '1',
    // SFDX_AUDIENCE_URL: "https://ap1.stmpa.stm.salesforce.com" //"https://login.stmpa.stm.salesforce.com"
};

export const shell = (
    cmd: string,
    _stdio: StdioOptions = 'inherit',
    _cwd: string = BASE_DIR,
    envars: Record<string, string> = {}
): ShellOutput => {
    let res: string;
    let e;
    let j = '';
    Object.assign(envars, envs);
    try {
        res = execSync(cmd, { stdio: _stdio, cwd: _cwd, env: envars }).toString();
        if (res) res = cleanConsoleCharacters(res);
        else return;
        try {
            j = JSON.parse(res);
        } catch (ee) {
            /* DON't Care maybe it's not a json object*/
        }
    } catch (error) {
        e = error;
        e.stdout = e.stdout ? cleanConsoleCharacters(e.stdout.toString()) : e.stdout;
        e.stderr = e.stderr ? cleanConsoleCharacters(e.stderr.toString()) : e.stderr;
        e.output = e.output ? e.output.map((v) => (v ? cleanConsoleCharacters(v.toString()) : v)) : e.output;
    }
    return {
        res,
        err: e ? e.message : '',
        error: e,
        json: j,
    };
};

class ShellOutput {
    public res: string;
    public err;
    public error;
    public json;
}

const cleanConsoleCharacters = (res: string): string =>
    // eslint-disable-next-line no-control-regex
    (res || '').replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

/**
 * Use this to run sfdx shell commands with json output ie: --json
 * This will check for error and throw sfdxerror or return the json object
 *
 * @param cmd sfdx command to run, if you don't pass --json then it'll put it in there for you
 * @param stdio if you don't want the result and for it to run without throwing exception then set studio to "inherit"
 * @param cwd
 * @param envars
 * @param retry
 */
export const shellJsonSfdx = <T>(
    cmd: string,
    stdio: StdioOptions = null,
    cwd: string = BASE_DIR,
    envars: Record<string, string> = {},
    retry: RetryConditions = new RetryConditions()
): Result<T> => {
    const oCmd = cmd;
    if (cmd.indexOf('--json') < 0) cmd = cmd + ' --json';
    let res = shell(cmd, stdio, cwd, envars);
    if (res && res.error && res.error.message && res.error.message.indexOf(msgs.getMessage('shell.errorCheck')) >= 0)
        res = shell(oCmd, stdio);
    if (stdio === 'inherit') return;
    if (!res.json && res.res && !res.error) return new Result(res.res);
    if (!res || !(res.json && res.res))
        if (res) {
            res['command'] = cmd;
            if (res.error && res.error.stdout && res.error.stdout.indexOf('status') >= 0) {
                const v = JSON.parse(res.error.stdout);
                v['command'] = cmd;
                throw new SfdxError(JSON.stringify(v, null, 4));
            } else throw new SfdxError(JSON.stringify(res));
        } else throw new SfdxError(msgs.getMessage('shell.noResultsForCommand') + cmd);
    // not a json result
    const jres = Object.assign(new Result(), res.json);
    jres.command = cmd;
    if (jres.status > 0 && !retry.shouldRetry(jres.name)) throw new SfdxError(JSON.stringify(jres, null, 4));
    if (jres.status > 0 && retry.shouldRetry(jres.name, true)) return shellJsonSfdx<T>(cmd, stdio, cwd, envars, retry);
    return jres;
};

export function shellDetached(command) {
    const args = parseArgsStringToArgv(command);
    const cmd = args.shift();
    return spawn(cmd, args);
}

/**
 * Class to determine if shellJsonSfdx should retry on failure.
 * By default errors will be empty so no retry and count will be 0 so no retry
 */
export class RetryConditions {
    get getErrors(): string[] {
        return this._errors;
    }

    get getCount(): number {
        return this._count;
    }

    get getCountDec(): number {
        return this._count--;
    }

    private _count = 0;
    private readonly _errors: string[] = [];
    private readonly _sleep: number = 0;

    /**
     *
     * @param count how many times to retry, negative is forever
     * @param errors which errors to retry on, empty is anything
     * @param _sleep how much time to sleep between retries 0 for no time
     */
    constructor(count = 0, errors: string[] = [], _sleep = 0) {
        this._count = count;
        this._errors = errors;
        this._sleep = _sleep;
    }

    public hasError(error: string) {
        return !this._errors || this._errors.includes(error);
    }

    public async shouldRetry(error: string, dec = false) {
        const isRetry = this.hasError(error) && (dec ? this.getCountDec : this.getCount) > 0;
        if (isRetry) await sleep(this._sleep);
        return isRetry;
    }
}
