import { ExecArray } from "xregexp";

import { Token } from "@/Tokens/Token";
import * as RegExps from "@/RegExps";
import * as RegExpUtils from "@/RegExpUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import XRegExp = require("xregexp");

export async function parseGrammarFile(grammarPath: string): Promise<Token[]> {
    const lines: string[] = await FileSystemEntryUtils.readFileLines(
        grammarPath
    );
    const tokens: Token[] = [];
    // const values: string[] = lines.map((line) => parseLine(line)).flat();

    return tokens;
}

function parseLine(line: string): Token[] {
    // Ignore empty lines and comments
    if (
        line.trim() === "" ||
        XRegExp.test(line, RegExps.bnfInternalCommentPattern)
    ) {
        return [];
    }

    const declarationMatch: ExecArray | null = XRegExp.exec(
        line,
        RegExps.bnfDeclarationPattern
    );

    if (declarationMatch) {
        const syntaxGroup: string = declarationMatch.groups?.syntax ?? "";

        RegExpUtils.findAllMatches(
            RegExps.bnfSyntaxPattern,
            syntaxGroup
        ).forEach((match) => {
            console.log(match.groups);
        });
    }

    const commentMatch: ExecArray | null = XRegExp.exec(
        line,
        RegExps.bnfCommentPattern
    );

    if (commentMatch) {
        const beginCommentGroup: string =
            commentMatch.groups?.beginComment ?? "";
        const endCommentGroup: string | undefined =
            commentMatch.groups?.endComment;

        if (endCommentGroup) {
            console.log(beginCommentGroup, endCommentGroup);
        }
    }

    return [];
}
