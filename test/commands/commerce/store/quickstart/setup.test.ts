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
