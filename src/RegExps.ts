import * as XRegExp from "xregexp";

export const bnfStartPattern: RegExp = XRegExp(/\s*BNFSyntax:\s*/g.source, "x");
export const bnfTokenPattern: RegExp = XRegExp(
    /\s*(?:(?<name>[^\s,]*)=(?<type>[^\s,]*))/g.source,
    "x"
);
export const splitWordsPattern: RegExp = XRegExp(
    /(^[a-z]+|[0-9]+|[A-Z][a-z]+|[A-Z]+(?=[A-Z][a-z]|$|[0-9]))/g.source,
    "x"
);
export const bnfCommentPattern: RegExp = XRegExp(/--.*/g.source, "x");
export const bnfDeclarationPattern: RegExp = XRegExp(
    /^(?<modifier>\w*\s+)?(?<type>\w+)\s*\.\s*(?<resultType>\S+)\s+::=\s+(?<syntax>(?:(?:"\S+"|\S+)\s*)+);/g
        .source,
    "x"
);
export const bnfSyntaxPattern: RegExp = XRegExp(
    /(?:(?<value>"[^"]+")|(?<type>[^\s"]+))(?:\s+|$)/g.source,
    "x"
);
