import {
    PredefinedTokenValues,
    tokenTypeByPredefinedTokenValue,
} from "./PredefinedTokens";
import { ExecArray } from "xregexp";

import * as EnumUtils from "@/EnumUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as RegExpUtils from "@/RegExpUtils";
import * as RegExps from "@/RegExps";
import { BlockCommentToken, RegularToken, Token, TokenType } from "@/Tokens/Token";

import XRegExp = require("xregexp");

export async function parseGrammarFile(grammarPath: string): Promise<Token[]> {
    const lines: string[] = await FileSystemEntryUtils.readFileLines(
        grammarPath
    );

    const tokens: Token[] = lines.map((line) => parseLine(line)).flat();

    // Remove duplicates from tokens
    const tokensByValue: Map<string, Token> = new Map();

    tokens.forEach((token) => {
        if (token.type !== TokenType.blockComment) {
            tokensByValue.set((token as RegularToken).value, token);
        }
        else {
            tokensByValue.set(
                (token as BlockCommentToken).begin + (token as BlockCommentToken).end,
                token
            );
        }
    });

    return Array.from(tokensByValue.values());
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

        const tokens: Token[] = [];

        RegExpUtils.findAllMatches(
            RegExps.bnfSyntaxPattern,
            syntaxGroup
        ).forEach((match) => {
            if (!match.groups?.string) {
                return;
            }

            const values: string[] = match.groups.string.split(" ");

            values.forEach((value) => {
                const predefinedTokenValue: PredefinedTokenValues | undefined =
                    EnumUtils.fromStringValue(PredefinedTokenValues, value);

                let tokenType: TokenType | undefined =
                    predefinedTokenValue &&
                    tokenTypeByPredefinedTokenValue[predefinedTokenValue];

                tokenType =
                    tokenType ||
                    (XRegExp.test(value, RegExps.containsLetterPattern)
                        ? TokenType.function
                        : TokenType.operator);

                console.log(value, tokenType);

                tokens.push({
                    type: tokenType,
                    value: value,
                } as RegularToken);
            });
        });

        return tokens;
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

    const terminatorMatch: ExecArray | null = XRegExp.exec(
        line,
        RegExps.bnfTerminatorPattern
    );

    if (terminatorMatch) {
        const terminatorGroup: string =
            terminatorMatch.groups?.terminator ?? "";

        return [
            {
                type: TokenType.terminator,
                value: terminatorGroup,
            },
        ];
    }

    const separatorMatch: ExecArray | null = XRegExp.exec(
        line,
        RegExps.bnfSeparatorPattern
    );

    if (separatorMatch) {
        const separatorGroup: string = separatorMatch.groups?.separator ?? "";

        return [
            {
                type: TokenType.separator,
                value: separatorGroup,
            },
        ];
    }

    return [];
}
