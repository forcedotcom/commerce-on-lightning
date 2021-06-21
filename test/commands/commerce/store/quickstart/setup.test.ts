/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import sinon, { stub } from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { IConfig } from '@oclif/config';
import { $$ } from '@salesforce/command/lib/test';
import { fs } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { StatusFileManager } from '../../../../../src/lib/utils/statusFileManager';
import { StoreQuickstartSetup } from '../../../../../src/commands/commerce/store/quickstart/setup';
import { DevHubConfig } from '../../../../../src/lib/utils/jsonUtils';

describe('commerce:store:quickstart:setup', () => {
    const config = stubInterface<IConfig>($$.SANDBOX, {});
    afterEach(() => {
        sinon.restore();
    });
    it('should update values from network meta file', async () => {
        const d = stub(StatusFileManager.prototype, 'setValue').resolves();
        const c = stub(StatusFileManager.prototype, 'getValue').resolves();
        const c1 = stub(fs, 'readFileSync').returns(
            '<networkMemberGroups>\n<a>b</a>\n<status>c</status>\n<enableGuestChatter>d</enableGuestChatter>\n<enableGuestFileAccess>e</enableGuestFileAccess>\n<selfRegistration>f</selfRegistration>'
        );
        const writeFileSyncStub = stub(fs, 'writeFileSync').resolves();
        const storeQuickstartSetup = new StoreQuickstartSetup([], config);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        storeQuickstartSetup.ux = stubInterface<UX>($$.SANDBOX);
        const dhc = new DevHubConfig();
        dhc.communityNetworkName = 'test';
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        storeQuickstartSetup.devHubConfig = dhc;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await storeQuickstartSetup.updateMemberListActivateCommunity();
        assert.equal(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            writeFileSyncStub.getCall(0).args[1],
            '<networkMemberGroups>\n' +
                '        <profile>Buyer_User_Profile_From_QuickStart</profile>\n' +
                '<a>b</a>\n' +
                '<status>Live</status>\n' +
                '<enableGuestChatter>true</enableGuestChatter>\n' +
                '<enableGuestFileAccess>true</enableGuestFileAccess>\n' +
                '<selfRegistration>true</selfRegistration>'
        );
        [c, c1, d].forEach((k) => k.restore());
    });
});
