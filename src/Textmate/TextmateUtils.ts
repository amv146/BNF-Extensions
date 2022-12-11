import * as Strings from "../Strings";
import * as TokenUtils from "../Tokens/TokenUtils";
import { TextmatePattern } from "./TextmatePattern";
import { Token, TokenType } from "../Tokens/Token";

export function generateTextmateJson(
    tokens: Token[],
    languageName: string,
    languageId: string
): string {
    const scopeNameRegex: RegExp = new RegExp(
        `^${escapeRegex(languageName)}\\.(.*)$`
    );

    const scopeName: string = languageId;

    const textmateJson = {
        $schema: Strings.textmateLanguageSchema,
        name: languageName,
        patterns: generatePatternIncludes(tokens),
        repository: generateRepository(tokens),
        scopeName: "source." + scopeName,
    };

    return JSON.stringify(textmateJson, null, 4);
}

export function generatePatternIncludes(
    tokens: Token[]
): Record<string, string>[] {
    let patternIncludes: { [key: string]: string }[] = [];

    const tokenTypes = new Set(tokens.map((token) => token.type));

    for (const tokenType of tokenTypes) {
        patternIncludes.push({
            include: `#${tokenType}`,
        });
    }

    return patternIncludes;
}

export function generateRepository(
    tokens: Token[]
): Record<string, Record<string, TextmatePattern[]>> {
    const repository: Record<string, Record<string, TextmatePattern[]>> = {};

    const tokensByType: Map<TokenType, Token[]> = new Map();

    tokens.forEach((token) => {
        const tokensOfType = tokensByType.get(token.type) ?? [];
        tokensOfType.push(token);
        tokensByType.set(token.type, tokensOfType);
    });

    for (const [tokenType, tokensOfType] of tokensByType) {
        repository[tokenType] = {
            patterns: [generatePattern(tokensOfType, tokenType)],
        };
    }

    return repository;
}

function generatePattern(
    tokens: Token[],
    tokenType: TokenType
): TextmatePattern {
    switch (tokenType) {
        case TokenType.comment:
            return generateLineCommentPattern(tokens, tokenType);
        case TokenType.operator:
            return generateBasicPattern(tokens, tokenType, false);
        default:
            return generateBasicPattern(tokens, tokenType);
    }
}

function generateNumberPattern(): TextmatePattern {
    return {
        match: "\\b[0-9]+\\b",
        name: "constant.numeric.lambda",
    };
}

function generateBasicPattern(
    tokens: Token[],
    tokenType: TokenType,
    wordBoundary: boolean = true
): TextmatePattern {
    const tokensRegex: string = tokens
        .map((token) => escapeRegex(token.name))
        .join("|");

    return {
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
        match:
            (wordBoundary && "\\b(") + tokensRegex + (wordBoundary && ")\\b"),
    };
}

function generateLineCommentPattern(
    tokens: Token[],
    tokenType: TokenType
): TextmatePattern {
    const tokensRegex: string = tokens
        .map((token) => escapeRegex(token.name))
        .join("|");

    return {
        begin: escapeRegex(tokensRegex),
        end: "$",
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
    };
}

function escapeRegex(string: String): string {
    return string.replace(/[-[\]{}()*+?.,^$|#\s]/g, "\\$&");
}
