import * as FileSystemEntryUtils from "../FileSystemEntryUtils";
import * as RegExpUtils from "../../RegExpUtils";
import * as RegExps from "../../RegExps";
import * as TextmateUtils from "../../Textmate/TextmateUtils";
import { TokenType, Token } from "../../Tokens/Token";
import { ExecArray } from "xregexp";
import * as XRegExp from "xregexp";
import { tokenTypeToTextmateScope } from "../../Tokens/TokenUtils";
import { TextmateScope } from "../../Textmate/TextmateScope";

export async function parseBNFFile(grammarPath: string): Promise<Token[]> {
    const lines: string[] = await FileSystemEntryUtils.readFileLines(
        grammarPath
    );
    const tokens: Token[] = [];

    for (const line of lines) {
        tokens.push(...parseLine(line));
    }

    return tokens;
}

function parseLine(line: string): Token[] {
    const bnfStartPatternMatch: ExecArray | null = XRegExp.exec(
        line,
        RegExps.bnfStartPattern
    );

    const startIndex: number = bnfStartPatternMatch
        ? bnfStartPatternMatch.index + bnfStartPatternMatch?.[0].length
        : -1;

    if (startIndex === -1) {
        return [];
    }

    const tokens: Token[] = [];

    const tokenMatches: ExecArray[] = RegExpUtils.findAllMatches(
        RegExps.bnfTokenPattern,
        line,
        startIndex
    );

    for (const tokenMatch of tokenMatches) {
        const token = {
            name: tokenMatch.groups?.name ?? "",
            type: tokenMatch.groups?.type as TokenType,
            textmateScope: tokenTypeToTextmateScope(
                tokenMatch.groups?.type as TokenType
            ),
        };

        tokens.push(token);
    }

    return tokens;
}
