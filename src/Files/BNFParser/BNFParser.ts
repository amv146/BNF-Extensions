import { ExecArray } from "xregexp";

import * as EnumUtils from "@/EnumUtils";
import * as LineTypeUtils from "@/Files/BNFParser/LineTypeUtils";
import * as PredefinedTokenUtils from "@/Files/BNFParser/PredefinedTokenUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as RegExpUtils from "@/RegExpUtils";
import * as RegExps from "@/RegExps";
import { LineResult } from "@/Files/BNFParser/LineResult";
import { LineType } from "@/Files/BNFParser/LineType";
import { PredefinedTokenValue } from "@/Files/BNFParser/PredefinedTokens";
import {
    BlockCommentToken,
    RegularToken,
    Token,
    TokenType,
} from "@/Tokens/Token";

import XRegExp = require("xregexp");

export function defaultTokens(): Token[] {
    const tokens: Token[] = [
        {
            type: TokenType.punctuation,
            value: "(",
        },
        {
            type: TokenType.punctuation,
            value: ")",
        },
    ];

    return tokens;
}

export async function parseGrammarFile(grammarPath: string): Promise<Token[]> {
    const lines: string[] = await FileSystemEntryUtils.readFileLines(
        grammarPath
    );

    const tokens: Token[] = lines.map((line) => parseLine(line)).flat();
    tokens.push(...defaultTokens());

    /**
     * Remove duplicates from tokens
     */
    const tokensByValue: Map<string, Token> = new Map();

    tokens.forEach((token) => {
        if (token.type !== TokenType.blockComment) {
            tokensByValue.set((token as RegularToken).value, token);
        } else {
            tokensByValue.set(
                (token as BlockCommentToken).begin +
                    (token as BlockCommentToken).end,
                token
            );
        }
    });

    return Array.from(tokensByValue.values());
}

function getLineResult(line: string): LineResult {
    for (const lineType of Object.values(LineType)) {
        if (lineType === LineType.unknown) {
            continue;
        }

        const regExp: RegExp = LineTypeUtils.lineTypeToBNFRegExp(lineType);
        const match: ExecArray | null = XRegExp.exec(line, regExp);

        if (match) {
            return {
                lineType,
                line,
                match,
            };
        }
    }

    return {
        lineType: LineType.unknown,
        line,
    };
}

function parseCommentRule(match: RegExpExecArray): Token[] {
    const beginCommentGroup: string = match.groups?.beginComment ?? "";
    const endCommentGroup: string | undefined = match.groups?.endComment;

    if (endCommentGroup) {
        return [
            {
                type: TokenType.blockComment,
                begin: beginCommentGroup,
                end: endCommentGroup,
            },
        ];
    }

    return [
        {
            type: TokenType.comment,
            value: beginCommentGroup,
        },
    ];
}

function parseDeclarationRule(match: RegExpExecArray): Token[] {
    const syntaxGroup: string = match.groups?.syntax ?? "";
    const tokens: Token[] = [];

    RegExpUtils.findAllMatches(RegExps.bnfSyntaxPattern, syntaxGroup).forEach(
        (match) => {
            if (!match.groups?.string) {
                return;
            }

            const values: string[] = match.groups.string.split(" ");

            values.forEach((value) => {
                const predefinedTokenValue: PredefinedTokenValue | undefined =
                    EnumUtils.fromStringValue(PredefinedTokenValue, value);

                let tokenType: TokenType | undefined =
                    predefinedTokenValue &&
                    PredefinedTokenUtils.predefinedTokenValueToTokenType(
                        predefinedTokenValue
                    );

                tokenType =
                    tokenType ||
                    (XRegExp.test(value, RegExps.containsLetterPattern)
                        ? TokenType.function
                        : TokenType.operator);

                tokens.push({
                    type: tokenType,
                    value: value,
                } as RegularToken);
            });
        }
    );

    return tokens;
}

function parseLine(line: string): Token[] {
    if (line.trim() === "") {
        return [];
    }

    const lineResult: LineResult = getLineResult(line);

    switch (lineResult.lineType) {
        case LineType.internalComment:
            return [];
        case LineType.commentRule:
            return parseCommentRule(lineResult.match);
        case LineType.declarationRule:
            return parseDeclarationRule(lineResult.match);
        case LineType.separatorRule:
            return parseSeparatorRule(lineResult.match);
        case LineType.terminatorRule:
            return parseTerminatorRule(lineResult.match);
        case LineType.internalRule:
        case LineType.unknown:
            return [];
    }
}

function parseSeparatorRule(match: RegExpExecArray): Token[] {
    const separatorGroup: string = match.groups?.separator ?? "";

    return [
        {
            type: TokenType.separator,
            value: separatorGroup,
        },
    ];
}

function parseTerminatorRule(match: RegExpExecArray): Token[] {
    const terminatorGroup: string = match.groups?.terminator ?? "";

    return [
        {
            type: TokenType.terminator,
            value: terminatorGroup,
        },
    ];
}
