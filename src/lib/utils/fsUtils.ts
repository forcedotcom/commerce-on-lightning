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
