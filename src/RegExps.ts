import * as XRegExp from "xregexp";

export const bnfStartPattern: RegExp = XRegExp("\\s*BNFSyntax:\\s*", "x");
export const bnfTokenPattern: RegExp = XRegExp(
    "\\s*(?:(?<name>[^\\s,]*)=(?<type>[^\\s,]*))",
    "x"
);
export const splitWordsPattern: RegExp =
    /(^[a-z]+|[0-9]+|[A-Z][a-z]+|[A-Z]+(?=[A-Z][a-z]|$|[0-9]))/g;
export const bnfValuePattern: RegExp = XRegExp('("(?<value>[^"]*)")', "x");
