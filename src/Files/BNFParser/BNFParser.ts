import * as FileSystemEntryUtils from "../FileSystemEntryUtils";
import * as RegExpUtils from "../../RegExpUtils";
import * as RegExps from "../../RegExps";
import * as TextmateUtils from "../../Textmate/TextmateUtils";
import { TokenType, Token } from "../../Tokens/Token";
import { ExecArray } from "xregexp";
import * as XRegExp from "xregexp";
import { tokenTypeToTextmateScope } from "../../Tokens/TokenUtils";
import { TextmateScope } from "../../Textmate/TextmateScope";
import { log } from "../../ConsoleUtils";

export async function parseBNFFile(grammarPath: string): Promise<Token[]> {
    const lines: string[] = await FileSystemEntryUtils.readFileLines(
        grammarPath
    );
    const tokens: Token[] = [];
    const values: string[] = lines.map((line) => parseLine(line)).flat();

    return tokens;
}

function parseLine(line: string): string[] {
    const matches: ExecArray[] = RegExpUtils.findAllMatches(
        RegExps.bnfValuePattern,
        line
    );

    for (const match of matches) {
        const value: string | undefined = match.groups?.value;

        if (value === undefined) {
            continue;
        }
    }

    return matches.map((match) => match.groups?.value ?? "");
}
