import * as ConfigUtils from "../Files/Config/ConfigUtils";
import * as vscode from "vscode";
import {
    DocumentSemanticTokensProvider,
    SemanticTokens,
    SemanticTokensBuilder,
    SemanticTokensLegend,
    ProviderResult,
    TextDocument,
} from "vscode";

import * as RegExpUtils from "@/RegExpUtils";
import * as PatternUtils from "@/Tokens/PatternUtils";
import * as TokenUtils from "@/Tokens/TokenUtils";
import { Project } from "@/Files/Project";
import {
    ParsedSemanticToken,
    SemanticTokenModifier,
    SemanticTokenType,
} from "@/Tokens/ParsedSemanticToken";
import { Pattern, RegularPattern } from "@/Tokens/Pattern";
import { Token, TokenType } from "@/Tokens/Token";

const semanticTokensLegend: SemanticTokensLegend = {
    tokenTypes: Object.values(SemanticTokenType),
    tokenModifiers: Object.values(SemanticTokenModifier),
};

export function getDocumentSemanticTokensProvider(
    project: Project
): DocumentSemanticTokensProvider {
    return {
        provideDocumentSemanticTokens: (
            document: vscode.TextDocument
        ): ProviderResult<SemanticTokens> =>
            provideDocumentSemanticTokens(document, project),
    };
}

export function getSemanticTokensLegend(): SemanticTokensLegend {
    return semanticTokensLegend;
}

export function tokenTypeToSemanticTokenType(
    tokenType: TokenType
): SemanticTokenType {
    switch (tokenType) {
        case TokenType.comment:
        case TokenType.blockComment:
            return SemanticTokenType.comment;
        case TokenType.keyword:
            return SemanticTokenType.keyword;
        case TokenType.string:
            return SemanticTokenType.string;
        case TokenType.number:
            return SemanticTokenType.number;
        case TokenType.operator:
            return SemanticTokenType.operator;
        case TokenType.type:
            return SemanticTokenType.type;
        case TokenType.function:
            return SemanticTokenType.function;
        default:
            return SemanticTokenType.keyword;
    }
}

function parseLineTokens(
    document: TextDocument,
    line: number,
    patterns: Pattern[]
): ParsedSemanticToken[] {
    const lineTokens: ParsedSemanticToken[] = [];

    const lineText = document.lineAt(line).text;

    for (const pattern of patterns) {
        // Check if the pattern is a comment pattern
        if (
            pattern.type === TokenType.blockComment ||
            pattern.type === TokenType.comment
        ) {
            continue;
        } else {
            const patternRegex = new RegExp(
                (pattern as RegularPattern).match,
                "g"
            );

            const matches: RegExpExecArray[] = RegExpUtils.findAllMatches(
                patternRegex,
                lineText
            );

            for (const match of matches) {
                const token = match[0];
                const type = (pattern as RegularPattern).type;
                const modifiers: SemanticTokenModifier[] = [];

                lineTokens.push({
                    range: new vscode.Range(
                        new vscode.Position(line, match.index),
                        new vscode.Position(line, match.index + token.length)
                    ),
                    type: tokenTypeToSemanticTokenType(type),
                    modifiers: modifiers,
                });
            }
        }
    }

    return lineTokens;
}

function provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    project: Project
): ProviderResult<SemanticTokens> {
    const builder = new SemanticTokensBuilder(semanticTokensLegend);

    const tokens: Token[] =
        ConfigUtils.generateTokensFromConfigGrammar(project);

    const tokensByType: Map<TokenType, Token[]> =
        TokenUtils.groupTokensByType(tokens);

    const patterns: Pattern[] = [];

    tokensByType.forEach((token, type) => {
        patterns.push(PatternUtils.generatePattern(token, type));
    });

    for (let line = 0; line < document.lineCount; line++) {
        const lineTokens = parseLineTokens(document, line, patterns);

        for (const token of lineTokens) {
            builder.push(token.range, token.type, token.modifiers);
        }
    }

    return builder.build();
}

// export function syntaxTokenToSemanticTokens(
//     document: TextDocument,
//     token: SyntaxToken
// ): ParsedSemanticToken[] {
//     const semanticTokens: ParsedSemanticToken[] = [];

//     const tokenType: SemanticTokenType = tokenTypeToSemanticTokenType();
//     const tokenModifiers: SemanticTokenModifier[] = [];

//     if (tokenType) {
//         semanticTokens.push({
//             line: token.line,
//             character: token.character,
//             length: token.length,
//             tokenType,
//             tokenModifiers,
//         });
//     }

//     return semanticTokens;
// }
