/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import path, { resolve } from 'path';
import { promisify } from 'util';
import { fs } from '@salesforce/core';
import parser from 'fast-xml-parser';
// import he from 'he';

/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
export function remove(filePath: string): void {
    try {
        if (fs.lstatSync(filePath).isDirectory()) fs.removeSync(filePath);
        else fs.unlinkSync(filePath);
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        if (e.message.indexOf('no such') < 0) throw e;
    }
}

export const readFileSync = (filepath: string): string =>
    fs.readFileSync(filepath.replace('~', os.homedir())).toString();

export function cleanName(name: string): string {
    return name.replace('@', 'AT').replace('.', 'DOT');
}

export function mkdirSync(name: string): string {
    try {
        fs.mkdirSync(name, { recursive: true });
    } catch (e) {
        /* DO NOTHING don't care if file already exists*/
    }
    return name;
}

export function copyFileSync(source: string, target: string): void {
    let targetFile = target;
    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target))
        if (fs.lstatSync(target).isDirectory()) targetFile = path.join(target, path.basename(source));
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

export function copyFolderRecursiveSync(source: string, target: string): void {
    let files = [];
    // Check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);
    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach((file) => {
            const curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) copyFolderRecursiveSync(curSource, targetFolder);
            else copyFileSync(curSource, targetFolder);
        });
    }
}
/* eslint-disable */
export async function getFiles(dir) {
    const readdir = promisify(fs.readdir);
    const stat = promisify(fs.stat);
    const subdirs = await readdir(dir);
    const files = await Promise.all(
        subdirs.map(async (subdir) => {
            const res = resolve(dir, subdir);
            return (await stat(res)).isDirectory() ? getFiles(res) : res;
        })
    );
    // @ts-ignore
    return files.reduce((a, f) => a.concat(f), []);
}
export async function renameRecursive(renameList, target) {
    // @ts-ignore
    (await getFiles(target)).forEach((file) => {
        for (const renameValue of renameList)
            if (file.indexOf(renameValue.name) >= 0)
                fs.renameSync(file, file.replace(renameValue['name'], renameValue['value']));
    });
}
/* eslint-disable */

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toString() + ' ' + sizes[i];
}

export class XML {
    /**
     * Converts an Extensible Markup Language (XML) string into an object.
     * @param text A valid XML string.
     * @param options
     * If a member contains nested objects, the nested objects are transformed before the parent object is.
     */
    public static parse(text: string, options?: {}): any {
        if (!options)
            options = {
                // attributeNamePrefix: "@_",
                // attrNodeName: "attr", //default is 'false'
                // textNodeName: "#text",
                ignoreAttributes: false,
                // ignoreNameSpace: false,
                // allowBooleanAttributes: false,
                // parseNodeValue: true,
                // parseAttributeValue: false,
                // trimValues: true,
                // cdataTagName: "__cdata", //default is 'false'
                // cdataPositionChar: "\\c",
                // parseTrueNumberOnly: false,
                // arrayMode: false, //"strict"
                // attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
                // tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
                // stopNodes: ["parse-me-as-string"]
            };
        if (parser.validate(text) === true) {
            //optional (it'll return an object in case it's not valid)
            return parser.parse(text, options);
        }

        // Intermediate obj
        const tObj = parser.getTraversalObj(text, options);
        return parser.convertToJson(tObj, options);
    }
    /**
     * Converts a JavaScript value to a Extensible Markup Language (XML) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer A function that transforms the results.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    public static stringify(value: any, defaultOptions?: {}): string {
        if (!defaultOptions)
            defaultOptions = {
                // attributeNamePrefix : "@_",
                // attrNodeName: "@", //default is false
                // textNodeName : "#text",
                ignoreAttributes: false,
                // cdataTagName: "__cdata", //default is false
                // cdataPositionChar: "\\c",
                format: true,
                indentBy: '  ',
                // supressEmptyNode: false,
                // tagValueProcessor: a=> he.encode(a, { useNamedReferences: true}),// default is a=>a
                // attrValueProcessor: a=> he.encode(a, {isAttributeValue: isAttribute, useNamedReferences: true})// default is a=>a
            };
        return new parser.j2xParser(defaultOptions).parse(value);
    }
}
