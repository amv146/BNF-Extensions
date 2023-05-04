import * as XRegExp from "xregexp";

export const bnfCommentPattern: RegExp = XRegExp(
    /comment\s+(?:"(?<beginComment>\S+)")\s+(?:"(?<endComment>\S+)")?\s*;/g
        .source,
    "x"
);
export const bnfDeclarationPattern: RegExp = XRegExp(
    /^(?<modifier>\w*\s+)?(?<rule>\w+)\s*\.\s*(?<valueCategory>\S+)\s+::=\s+(?<syntax>(?:(?:"\S+"|\S+)\s*)+);/g
        .source,
    "x"
);
export const bnfInternalCommentPattern: RegExp = XRegExp(/--.*/g.source, "x");
export const bnfSyntaxPattern: RegExp = XRegExp(
    /(?:"(?<string>[^"]+)"|(?<category>[^\s"]+))(?:\s+|$)/g.source,
    "x"
);
export const bnfTokenPattern: RegExp = XRegExp(
    /\s*(?:(?<name>[^\s,]*)=(?<type>[^\s,]*))/g.source,
    "x"
);
export const bnfTerminatorPattern: RegExp = XRegExp(
    /terminator\s+(?<category>\S+)\s+(?:"(?<terminator>\S+)")\s*;/g.source,
    "x"
);
export const bnfSeparatorPattern: RegExp = XRegExp(
    /separator\s+(?<category>\S+)\s+(?:"(?<separator>\S+)")\s*;/g.source,
    "x"
);
export const characterPattern: RegExp = XRegExp(
    /(?<character>(?:'(?:[^']|')*')|(?:`(?:[^`]|`)*`))/g.source,
    "x"
);
export const containsLetterPattern: RegExp = XRegExp(/[a-zA-Z]/g.source, "x");
export const increaseIndentPattern: RegExp = XRegExp(
    /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/g.source,
    "x"
);

export const numberPattern: RegExp = XRegExp(
    /(?<number>(?:0x[0-9a-fA-F]+)|(?:0b[01]+)|(?:\d+\.\d+)|(?:\d+))/g.source,
    "x"
);
export const splitWordsPattern: RegExp = XRegExp(
    /(^[a-z]+|[0-9]+|[A-Z][a-z]+|[A-Z]+(?=[A-Z][a-z]|$|[0-9]))/g.source,
    "x"
);
export const stringPattern: RegExp = XRegExp(
    /(?<string>(?:"(?:[^"]|")*"))/g.source,
    "x"
);
