import { ExecArray } from "xregexp";

import { Token } from "@/Tokens/Token";
import * as RegExps from "@/RegExps";
import * as RegExpUtils from "@/RegExpUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";

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
