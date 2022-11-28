/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

function contains(v: string, a): boolean {
    for (const i of a) if (i === v) return true;
    return false;
}

/**
 * This function will read in a list of flags from sfdxCommand parameter
 * then filter through argv parameter and keep only the ones in the former
 *
 * @param argv
 * @param sfdxCommand
 * @return
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function addAllowedArgs(argv: string[], sfdxCommand): string[] {
    // TODO update this to include vargs if sfdxCommand['vargsAllowList']
    const args = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const flags = sfdxCommand.flags;
    const flagsArr = [];
    Object.keys(flags).forEach((f) => {
        flagsArr.push('--' + f);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-plus-operands
        if (flags[f].char) flagsArr.push('-' + flags[f].char);
    });
    for (let i = 0; i < argv.length; i++) {
        let arg = argv[i];
        let value = argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[++i] : undefined;
        if (!arg.startsWith('--') && arg.length > '-v'.length) {
            value = arg.substr('-v'.length);
            arg = arg.substr(0, '-v'.length);
        }
        if (contains(arg, flagsArr)) {
            args.push(arg);
            if (value) args.push(value);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return args;
}

/**
 * Adds value to flag in argv list or adds flag and value to list if not present
 *
 * @param flag
 * @param value
 * @param argv
 */
export function modifyArgFlag(flag: string[], value: string, argv: string[]): void {
    // TODO update this to include vargs if sfdxCommand['vargsAllowList']
    let isModified = false;
    for (let i = 0; i < argv.length; i++) {
        if (!argv[i].startsWith('-')) continue;
        for (const j of flag)
            if (j === argv[i]) {
                argv[i + 1] = value + '';
                isModified = true;
            }
    }
    if (!isModified) {
        argv.push(flag[0]);
        argv.push(value);
    }
}

/**
 *
 * @param desiredFlags flags you want
 * @param flagOptions the flags to pick from
 * @param isInclude if true then pick from desiredFlags, if false then discarded the desiredFlags
 */
// eslint-disable-next-line @typescript-eslint/ban-types,no-shadow
export function filterFlags(desiredFlags: string[], flagOptions: {}, isInclude = true): {} {
    // TODO update this to include vargs if sfdxCommand['vargsAllowList']
    return Object.keys(flagOptions)
        .filter((key) => (isInclude ? desiredFlags.includes(key) : !desiredFlags.includes(key)))
        .reduce((obj, key) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            obj[key] = flagOptions[key];
            return obj;
        }, {});
}

export function addFlagBeforeAll(flag: string, cmds: string[]): string[] {
    if (!cmds) return cmds;
    const v: string[] = [];
    cmds.forEach((a) => {
        v.push(flag);
        v.push(a);
    });
    return v;
}

export const removeFlagBeforeAll = (flag: string, cmds: string[]): string[] => {
    if (!cmds) return cmds;
    return cmds.filter((c) => c !== flag);
};
