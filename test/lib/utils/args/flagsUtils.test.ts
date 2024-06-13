/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { Config, ConfigAggregator, Logger, Org } from '@salesforce/core';
import sinon, { stub } from 'sinon';
import {
    addAllowedArgs,
    appendCommonFlags,
    CONFIG_PROP_API_VERSION,
    ENV_PROP_SFDX_API_VERSION,
} from '../../../../src/lib/utils/args/flagsUtils';
import { StoreCreate } from '../../../../src/commands/commerce/store/create';
import { setApiVersion } from '../../../../src/lib/utils/args/flagsUtils';

let localConfigStub: sinon.SinonStub;
let globalConfigStub: sinon.SinonStub;
let envConfigStub: sinon.SinonStub;
let configAggregatorStub: sinon.SinonStub;
let maxApiversionStub: sinon.SinonStub;

async function stubOrg(
    localApiVersion: string,
    globalApiVersion: string,
    envApiVersion: string,
    orgMaxApiVersion: string
): Promise<Org> {
    const localConfig = new Config();
    await localConfig.write({
        [CONFIG_PROP_API_VERSION]: localApiVersion,
    });
    const globalConfig = new Config();
    await globalConfig.write({
        [CONFIG_PROP_API_VERSION]: globalApiVersion,
    });
    const envConfig = new Map();
    envConfig.set(ENV_PROP_SFDX_API_VERSION, envApiVersion);
    return stubOrgWithConfigs(localConfig, globalConfig, envConfig, orgMaxApiVersion);
}

function stubOrgWithConfigs(
    localConfig: Config,
    globalConfig: Config,
    envConfig: Map<string, string>,
    orgMaxApiVersion: string
): Org {
    const configAggregator = new ConfigAggregator({});
    localConfigStub = stub(configAggregator, 'getLocalConfig').returns(localConfig);
    globalConfigStub = stub(configAggregator, 'getGlobalConfig').returns(globalConfig);
    envConfigStub = stub(configAggregator, 'getEnvVars').returns(envConfig);

    const org = new Org({});
    configAggregatorStub = stub(org, 'getConfigAggregator').returns(configAggregator);
    maxApiversionStub = stub(org, 'retrieveMaxApiVersion').resolves(orgMaxApiVersion);

    return org;
}
function restoreStubs() {
    localConfigStub.restore();
    globalConfigStub.restore();
    envConfigStub.restore();
    configAggregatorStub.restore();
    maxApiversionStub.restore();
}

describe('flagsUtils add allowed args', () => {
    it('should add only args that the sfdxcommand Auth allows', async () => {
        const res = addAllowedArgs(['-c', 'hi', '-b', 'bye'], StoreCreate);
        // -c is not allowed but -b is so i don't expect -c or it's value to exist in assert
        assert.deepEqual(res, ['-b', 'bye']);
    });
    it('should add args that has long names', async () => {
        const res = addAllowedArgs(['--test-arg', 'hi', '--buyer-username', 'bye'], StoreCreate);
        assert.deepEqual(res, ['--buyer-username', 'bye']);
    });
    it('should add args that has long name and short names', async () => {
        const res = addAllowedArgs(['-n', 'hi', '--buyer-username', 'bye'], StoreCreate);
        assert.deepEqual(res, ['-n', 'hi', '--buyer-username', 'bye']);
    });
    it('should add args that has "=" in short name ', async () => {
        const res = addAllowedArgs(['-n=hi', '-b=bye'], StoreCreate);
        assert.deepEqual(res, ['-n', 'hi', '-b', 'bye']);
    });
    it('should add args that has "=" in long name', async () => {
        const res = addAllowedArgs(['--store-name=hi', '--buyer-username=bye'], StoreCreate);
        assert.deepEqual(res, ['--store-name', 'hi', '--buyer-username', 'bye']);
    });
    it('should add args that has "=" only in long name', async () => {
        const res = addAllowedArgs(['--store-name=hi', '-b', 'bye'], StoreCreate);
        assert.deepEqual(res, ['--store-name', 'hi', '-b', 'bye']);
    });
});

describe('Sets the api version based on the priority', () => {
    after(() => {
        sinon.restore();
    });
    it('should set the version specified in flags', async () => {
        const org = await stubOrg(undefined, undefined, undefined, undefined);
        const flags = { apiversion: '56.0' };
        await setApiVersion(org, flags);
        assert.equal(flags.apiversion, '56.0');
        restoreStubs();
    });
    it('should set the api version specified in local config', async () => {
        const localApiVersion = '54.0';
        const globalApiVersion = '55.0';
        const envApiVersion = '56.0';
        const orgMaxApiVersion = '57.0';
        const org = await stubOrg(localApiVersion, globalApiVersion, envApiVersion, orgMaxApiVersion);
        const flags = {};
        await setApiVersion(org, flags);
        assert.equal(flags['apiversion'], localApiVersion);
        sinon.assert.calledTwice(localConfigStub);
        restoreStubs();
    });
    it('should set the api version specified in global config', async () => {
        const localApiVersion = undefined;
        const globalApiVersion = '55.0';
        const envApiVersion = '56.0';
        const orgMaxApiVersion = '57.0';
        const org = await stubOrg(localApiVersion, globalApiVersion, envApiVersion, orgMaxApiVersion);
        const flags = {};
        await setApiVersion(org, flags);
        assert.equal(flags['apiversion'], globalApiVersion);
        sinon.assert.calledOnce(localConfigStub);
        sinon.assert.calledTwice(globalConfigStub);
        restoreStubs();
    });
    it('should set the api version specified in env', async () => {
        const localApiVersion = undefined;
        const globalApiVersion = undefined;
        const envApiVersion = '56.0';
        const orgMaxApiVersion = '57.0';
        const org = await stubOrg(localApiVersion, globalApiVersion, envApiVersion, orgMaxApiVersion);
        const flags = {};
        await setApiVersion(org, flags);
        assert.equal(flags['apiversion'], envApiVersion);
        sinon.assert.calledOnce(localConfigStub);
        sinon.assert.calledOnce(globalConfigStub);
        sinon.assert.calledTwice(envConfigStub);
        restoreStubs();
    });
    it('should set the max api version from the org when no other config is specified', async () => {
        const localApiVersion = undefined;
        const globalApiVersion = undefined;
        const envApiVersion = undefined;
        const orgMaxApiVersion = '57.0';
        const org = await stubOrg(localApiVersion, globalApiVersion, envApiVersion, orgMaxApiVersion);
        const flags = {};
        await setApiVersion(org, flags);
        assert.equal(flags['apiversion'], orgMaxApiVersion);
        sinon.assert.calledOnce(localConfigStub);
        sinon.assert.calledOnce(globalConfigStub);
        sinon.assert.calledOnce(envConfigStub);
        sinon.assert.calledOnce(maxApiversionStub);
        restoreStubs();
    });
    it('Handles when localconfig object is undefined', async () => {
        const globalApiVersion = '55.0';
        const envApiVersion = '56.0';
        const orgMaxApiVersion = '57.0';

        const globalConfig = new Config();
        await globalConfig.write({
            [CONFIG_PROP_API_VERSION]: globalApiVersion,
        });
        const envConfig = new Map();
        envConfig.set(ENV_PROP_SFDX_API_VERSION, envApiVersion);
        const org = stubOrgWithConfigs(undefined, globalConfig, envConfig, orgMaxApiVersion);

        const flags = {};
        await setApiVersion(org, flags);
        assert.equal(flags['apiversion'], globalApiVersion);
        sinon.assert.calledOnce(localConfigStub);
        sinon.assert.calledTwice(globalConfigStub);
        restoreStubs();
    });
    it('Handles when globalconfig object is undefined', async () => {
        const envApiVersion = '56.0';
        const orgMaxApiVersion = '57.0';

        const envConfig = new Map();
        envConfig.set(ENV_PROP_SFDX_API_VERSION, envApiVersion);
        const org = stubOrgWithConfigs(undefined, undefined, envConfig, orgMaxApiVersion);

        const flags = {};
        await setApiVersion(org, flags);
        assert.equal(flags['apiversion'], envApiVersion);
        sinon.assert.calledOnce(localConfigStub);
        sinon.assert.calledOnce(globalConfigStub);
        sinon.assert.calledTwice(envConfigStub);
        restoreStubs();
    });
    it('Handles when envVars object is undefined', async () => {
        const orgMaxApiVersion = '57.0';

        const org = stubOrgWithConfigs(undefined, undefined, undefined, orgMaxApiVersion);

        const flags = {};
        await setApiVersion(org, flags);
        assert.equal(flags['apiversion'], orgMaxApiVersion);
        sinon.assert.calledOnce(localConfigStub);
        sinon.assert.calledOnce(globalConfigStub);
        sinon.assert.calledOnce(envConfigStub);
        sinon.assert.calledOnce(maxApiversionStub);
        restoreStubs();
    });
    it('handles when org is undefined', async () => {
        const flags = {};
        await setApiVersion(undefined, flags);
        assert.equal(flags['apiversion'], undefined);
    });
});

describe('appends common flags to the given command', () => {
    const logger = new Logger('test');
    let loggerStub: sinon.SinonStub;
    after(() => {
        sinon.restore();
    });
    beforeEach(() => {
        loggerStub = sinon.stub(logger, 'debug').returns(logger);
    });
    afterEach(() => {
        loggerStub.restore();
    });
    it('should set the version specified in flags', async () => {
        let command = 'sf test';
        const flags = { apiversion: '56.0' };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
        command = appendCommonFlags(command, flags, logger);
        assert.equal(command, 'sf test --api-version=56.0');
    });
    it('handles undefined apiversion', async () => {
        let command = 'sf test';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
        command = appendCommonFlags(command, {}, logger);
        assert.equal(command, 'sf test');
    });
    it('handles undefined flags object', async () => {
        let command = 'sf test';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
        command = appendCommonFlags(command, undefined, logger);
        assert.equal(command, 'sf test');
    });
});
