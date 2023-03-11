import { ExecArray } from "xregexp";

import { Token } from "@/Tokens/Token";
import * as RegExps from "@/RegExps";
import * as RegExpUtils from "@/RegExpUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import XRegExp = require("xregexp");

export async function parse(grammarPath: string): Promise<Token[]> {
    const lines: string[] = await FileSystemEntryUtils.readFileLines(
        grammarPath
    );
    const tokens: Token[] = [];
    const values: string[] = lines.map((line) => parseLine(line)).flat();

    return tokens;
}

function parseLine(line: string): string[] {
    const lineMatch: ExecArray | null = XRegExp.exec(
        line,
        RegExps.bnfDeclarationPattern
    );

    if (!lineMatch) {
        return [];
    }

    const syntaxGroup: string = lineMatch.groups?.syntax ?? "";

    console.log(syntaxGroup);

    RegExpUtils.findAllMatches(RegExps.bnfSyntaxPattern, syntaxGroup).forEach(
        (match) => {
            console.log(match.groups);
        }
    );

    return [];
}
