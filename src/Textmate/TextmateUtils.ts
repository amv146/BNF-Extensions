import * as Strings from "@/Strings";
import * as TokenUtils from "@/Tokens/TokenUtils";
import { TextmatePattern } from "@/Textmate/TextmatePattern";
import { Token, TokenType } from "@/Tokens/Token";
import { TextmateRepository } from "@/Textmate/TextmateRepository";

export function generateTextmateJson(
    tokens: Token[],
    languageName: string,
    languageId: string
): string {
    const scopeNameRegex: RegExp = new RegExp(
        `^${escapeRegex(languageName)}\\.(.*)$/`
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
    let patternIncludes: Record<string, string>[] = [];

    const uniqueTokenTypes: Set<TokenType> = new Set(
        tokens.map((token) => token.type)
    );

    patternIncludes = Array.from(uniqueTokenTypes).map((tokenType) => {
        return {
            include: `#${tokenType}`,
        };
    });

    return patternIncludes;
}

export function generateRepository(tokens: Token[]): TextmateRepository {
    const repository: TextmateRepository = {};

    // Group tokens by their types into a map
    const tokensByType: Map<TokenType, Token[]> = tokens.reduce(
        (currentTokensByType, token) => {
            const tokensOfType = currentTokensByType.get(token.type) ?? [];

            return currentTokensByType.set(token.type, [
                ...tokensOfType,
                token,
            ]);
        },
        new Map<TokenType, Token[]>()
    );

    tokensByType.forEach((tokensOfType, tokenType) => {
        repository[tokenType] = {
            patterns: [generatePattern(tokensOfType, tokenType)],
        };
    });

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
        match: /\b[0-9]+\b/.source,
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

    if (wordBoundary) {
        return {
            name: TokenUtils.tokenTypeToTextmateScope(tokenType),
            match: /\b(${tokensRegex})\b/.source,
        };
    }

    return {
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
        match: tokensRegex,
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
        end: /$/.source,
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
    };
}

function escapeRegex(string: String): string {
    return string.replace(/[-[\]{}()*+?.,^$|#\s]/g, "\\$&");
}
