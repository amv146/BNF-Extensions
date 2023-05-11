import * as XRegExp from "xregexp";
import { ExecArray } from "xregexp";

import * as RegExps from "@/RegExps";

XRegExp.install({
    // Enables support for astral code points in Unicode addons (implicitly sets flag A)

    // Adds named capture groups to the `groups` property of matches
    // On by default in XRegExp 5
    namespacing: true,
});

export function addWordBoundaries(regex: string): string {
    return `\\b(${regex})\\b`;
}

export function containsLetter(text: string): boolean {
    return XRegExp.test(text, RegExps.containsLetterPattern);
}

export function increaseIndentRegex(
    lineComment: string,
    brackets: [string, string][]
): RegExp {
    return XRegExp(
        `^((?!${escapeRegex(lineComment)}).)*(${brackets
            .map((bracket) => {
                if (bracket[0] === "[") {
                    return `\\${bracket}[^]"'\\\`]*`;
                }

                return `${escapeRegex(bracket[0])}[^${escapeRegex(
                    bracket[1]
                )}"'\\\`]*`;
            })
            .join("|")})$`,
        "gs"
    );
}

export function matchStringRegex(values: string[]): RegExp {
    return XRegExp(
        values
            .map(
                (value) =>
                    `(${escapeRegex(value)}([^${escapeRegex(
                        value
                    )}\\]|\\[\s\S])*${escapeRegex(value)})`
            )
            .join("|"),
        "gs"
    );
}

export function escapeRegex(string: string): string {
    return string.replace(/[-[\]{}()*+?.,^$|#\s]/g, "\\$&");
}

export function findAllMatches(
    regex: RegExp,
    text: string,
    index = 0
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
