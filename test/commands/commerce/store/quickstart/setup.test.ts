/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// import { strict as assert } from 'assert';
// import sinon, { stub } from 'sinon';
// import { stubInterface } from '@salesforce/ts-sinon';
// import { IConfig } from '@oclif/config';
// import { $$ } from '@salesforce/command/lib/test';
// import { fs, Org } from '@salesforce/core';
// import { UX } from '@salesforce/command';
// import { QueryResult } from '@mshanemc/plugin-helpers/dist/typeDefs';
// import { StatusFileManager } from '../../../../../src/lib/utils/statusFileManager';
// import { StoreQuickstartSetup } from '../../../../../src/commands/commerce/store/quickstart/setup';
// import * as forceOrgSoqlExports from '../../../../../src/lib/utils/sfdx/forceDataSoql';
// import { Result } from '../../../../../src/lib/utils/jsonUtils';
//
import { strict as assert } from 'assert';

describe('test updating self reg', () => {
    it('should format file correctly', () => {
        const res = testFile
            .replace(/<selfRegProfile>.*<\/selfRegProfile>/g, '')
            .replace(
                '</Network>',
                '    <selfRegProfile>Buyer_User_Profile_From_QuickStart</selfRegProfile>\n</Network>'
            );
        assert.ok(
            (res.match(/<selfRegProfile>[Bb]uyer_[Uu]ser_[Pp]rofile_[Ff]rom_[Qq]uickStart<\/selfRegProfile>/g) || [])
                .length === 1
        );
    });
});

const testFile = `<?xml version="1.0" encoding="UTF-8"?>
<Network xmlns="http://soap.sforce.com/2006/04/metadata">
    <allowInternalUserLogin>false</allowInternalUserLogin>
    <allowMembersToFlag>false</allowMembersToFlag>
    <changePasswordTemplate>unfiled$public/CommunityChangePasswordEmailTemplate</changePasswordTemplate>
    <communityRoles/>
    <description>Store 200commerce created by Quick Start script.</description>
    <disableReputationRecordConversations>true</disableReputationRecordConversations>
    <emailSenderAddress>jarndt@salesforce.com</emailSenderAddress>
    <emailSenderName>200commerce</emailSenderName>
    <enableCustomVFErrorPageOverrides>false</enableCustomVFErrorPageOverrides>
    <enableDirectMessages>true</enableDirectMessages>
    <enableExperienceBundleBasedSnaOverrideEnabled>true</enableExperienceBundleBasedSnaOverrideEnabled>
    <enableGuestChatter>false</enableGuestChatter>
    <enableGuestFileAccess>false</enableGuestFileAccess>
    <enableGuestMemberVisibility>false</enableGuestMemberVisibility>
    <enableInvitation>false</enableInvitation>
    <enableKnowledgeable>false</enableKnowledgeable>
    <enableMemberVisibility>false</enableMemberVisibility>
    <enableNicknameDisplay>true</enableNicknameDisplay>
    <enablePrivateMessages>false</enablePrivateMessages>
    <enableReputation>false</enableReputation>
    <enableShowAllNetworkSettings>false</enableShowAllNetworkSettings>
    <enableSiteAsContainer>true</enableSiteAsContainer>
    <enableTalkingAboutStats>true</enableTalkingAboutStats>
    <enableTopicAssignmentRules>true</enableTopicAssignmentRules>
    <enableTopicSuggestions>false</enableTopicSuggestions>
    <enableUpDownVote>false</enableUpDownVote>
    <forgotPasswordTemplate>unfiled$public/CommunityForgotPasswordEmailTemplate</forgotPasswordTemplate>
    <gatherCustomerSentimentData>false</gatherCustomerSentimentData>
    <networkMemberGroups>
        <profile>admin</profile>
    </networkMemberGroups>
    <networkPageOverrides>
        <changePasswordPageOverrideSetting>Standard</changePasswordPageOverrideSetting>
        <forgotPasswordPageOverrideSetting>Designer</forgotPasswordPageOverrideSetting>
        <homePageOverrideSetting>Designer</homePageOverrideSetting>
        <loginPageOverrideSetting>Designer</loginPageOverrideSetting>
        <selfRegProfilePageOverrideSetting>Designer</selfRegProfilePageOverrideSetting>
    </networkPageOverrides>
    <picassoSite>X200commerce1</picassoSite>
    <selfRegistration>false</selfRegistration>
    <sendWelcomeEmail>true</sendWelcomeEmail>
    <selfRegProfile>buyer_user_profile_from_quickStart</selfRegProfile>
    <site>X200commerce</site>
    <status>Live</status>
    <tabs>
        <defaultTab>home</defaultTab>
        <standardTab>Chatter</standardTab>
    </tabs>
    <urlPathPrefix>200commerce</urlPathPrefix>
    <welcomeTemplate>unfiled$public/CommunityWelcomeEmailTemplate</welcomeTemplate>
    <selfRegProfile>Buyer_User_Profile_From_QuickStart</selfRegProfile>
    <selfRegProfile>Buyer_User_Profile_From_QuickStart</selfRegProfile>
</Network>
`;

// describe('commerce:store:quickstart:setup', () => {
//     const config = stubInterface<IConfig>($$.SANDBOX, {});
//     afterEach(() => {
//         sinon.restore();
//     });
//     it('should update values from network meta file', async () => {
//         const sfm = new StatusFileManager('a', 'b', 'c');
//         const d = stub(sfm, 'setValue').resolves();
//         const c = stub(sfm, 'getValue').resolves();
//         const c1 = stub(fs, 'readFileSync').returns(
//             '<networkMemberGroups>\n<a>b</a>\n<status>c</status>\n<enableGuestChatter>d</enableGuestChatter>\n<enableGuestFileAccess>e</enableGuestFileAccess>\n<selfRegistration>f</selfRegistration>'
//         );
//         const writeFileSyncStub = stub(fs, 'writeFileSync').resolves();
//         const qr = new Result<QueryResult>();
//         qr.result = new (class implements QueryResult {
//             public done: boolean;
//             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//             // @ts-ignore
//             public records: Record[] = [{ Type: 'B2C' }];
//             public totalSize: number;
//         })();
//         const c2 = stub(forceOrgSoqlExports, 'forceDataSoql').returns(qr);
//         const c3 = stub(fs, 'existsSync').returns(true);
//         const storeQuickstartSetup = new StoreQuickstartSetup([], config);
//         const org = await Org.create({ aliasOrUsername: 'foo@example.com' });
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
//         (storeQuickstartSetup as any).varargs = { communitySiteName: 'test' };
//         storeQuickstartSetup.org = org;
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         storeQuickstartSetup.ux = stubInterface<UX>($$.SANDBOX);
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         storeQuickstartSetup.statusFileManager = sfm;
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         storeQuickstartSetup.flags = Object.assign({}, { 'store-name': 'test' });
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         await storeQuickstartSetup.updateMemberListActivateCommunity();
//         assert.equal(
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
//             writeFileSyncStub.getCall(0).args[1],
//             '<networkMemberGroups>\n' +
//                 '        <profile>Buyer_User_Profile_From_QuickStart</profile>\n' +
//                 '<status>Live</status>\n' +
//                 '<enableGuestChatter>true</enableGuestChatter>\n' +
//                 '<enableGuestFileAccess>true</enableGuestFileAccess>\n' +
//                 '<selfRegistration>true</selfRegistration>'
//         );
//         [c, c1, c2, c3, d].forEach((k) => k.restore());
//     });
// });
