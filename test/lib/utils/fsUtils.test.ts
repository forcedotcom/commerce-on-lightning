/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { strict as assert } from 'assert';
import { fs } from '@salesforce/core';
import { cleanName } from '../../../src/lib/utils/fsUtils';
import { XML } from '../../../src/lib/utils/fsUtils';
import { B_DIR } from '../../../src/lib/utils/constants/properties';

describe('fsUtils clean name', () => {
    it('should turn @ into AT and . into DOT', async () => {
        assert.equal(cleanName('a@hi.com'), 'aAThiDOTcom');
    });
});
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
describe('fsUtils xml', () => {
    it('should turn xml to object', async () => {
        const res = XML.parse('<hi r="m"><bye>a</bye><hello z="w" m="5">q</hello></hi>');
        assert.equal(
            JSON.stringify(res),
            '{"hi":{"@_r":"m","bye":"a","hello":{"#text":"q","@_z":"w","@_m":"5"}}}'.replace(
                /[\r\n\t]+(.+[\r\n\t]+.+)[\t\r\n]+/,
                ''
            )
        );
    });
    it('should turn string to xml', async () => {
        const res = XML.stringify(JSON.parse('{"hi":{"@_r":"m","bye":"a","hello":{"#text":"q","@_z":"w","@_m":"5"}}}'));
        assert.equal(res, '<hi r="m">\n' + '  <bye>a</bye>\n' + '  <hello z="w" m="5">q</hello>\n' + '</hi>\n');
    });
    it('should parse package deploy template', async () => {
        const res = XML.parse(fs.readFileSync(B_DIR + '/quickstart-config/b2c-package-deploy-template.xml').toString());
        res['Package']['types'] = res['Package']['types'].filter((t) => t['members'] !== 'ProductCatalog');
        const out = XML.stringify(res);
        assert.equal(
            out,
            '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
                '  <types>\n' +
                '    <members>*</members>\n' +
                '    <name>CustomSite</name>\n' +
                '  </types>\n' +
                '  <types>\n' +
                '    <members>*</members>\n' +
                '    <name>ExperienceBundle</name>\n' +
                '  </types>\n' +
                '  <types>\n' +
                '    <members>*</members>\n' +
                '    <name>Network</name>\n' +
                '  </types>\n' +
                '  <types>\n' +
                '    <members>Product2</members>\n' +
                '    <name>SharingRules</name>\n' +
                '  </types>\n' +
                '  <types>\n' +
                '    <members>*</members>\n' +
                '    <name>NavigationMenu</name>\n' +
                '  </types>\n' +
                '  <version>52</version>\n' +
                '</Package>\n'
        );
    });
});
/* eslint-disable */
