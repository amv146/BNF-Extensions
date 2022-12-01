import * as RegExps from "./RegExps";
import * as XRegExp from "xregexp";

import { ExecArray } from "xregexp";

XRegExp.install({
    // Enables support for astral code points in Unicode addons (implicitly sets flag A)

    // Adds named capture groups to the `groups` property of matches
    // On by default in XRegExp 5
    namespacing: true,
});

export function findAllMatches(
    regex: RegExp,
    text: string,
    index: number = 0
): ExecArray[] {
    const matches: ExecArray[] = [];
    let match: ExecArray | null;

    while ((match = XRegExp.exec(text, regex, index))) {
        matches.push(match);
        index = match.index + match[0].length;
    }

    return matches;
}

export function splitWords(text: string): string[] {
    return text.split(RegExps.splitWordsPattern).filter((word) => word !== "");
}
