import * as RegExps from "@/RegExps";
import * as RegExpUtils from "@/RegExpUtils";
import * as Strings from "@/Strings";
import * as TokenUtils from "@/Tokens/TokenUtils";
import { TextmatePattern } from "@/Textmate/TextmatePattern";
import {
    BlockCommentToken,
    RegularToken,
    Token,
    TokenType,
} from "@/Tokens/Token";
import { TextmateRepository } from "@/Textmate/TextmateRepository";

export function generateTextmateJson(
    tokens: Token[],
    languageName: string,
    languageId: string
): string {
    const scopeNameRegex: RegExp = new RegExp(
        `^${RegExpUtils.escapeRegex(languageName)}\\.(.*)$/`
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

function generateJoinedTokenRegex<T extends Token>(
    tokens: T[],
    tokenPropertyCallback: (token: T) => string
): string {
    return tokens
        .map((token) => RegExpUtils.escapeRegex(tokenPropertyCallback(token)))
        .join("|");
}

function generateBasicPattern(
    tokens: RegularToken[],
    tokenType: TokenType,
    wordBoundary: boolean = true
): TextmatePattern {
    const tokensRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.value
    );

    return {
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
        match: wordBoundary ? `\\b(${tokensRegex})\\b` : tokensRegex,
    };
}

function generateBlockCommentPattern(
    tokens: BlockCommentToken[]
): TextmatePattern {
    const beginRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.begin
    );

    const endRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.end
    );

    return {
        begin: beginRegex,
        end: endRegex,
        name: TokenUtils.tokenTypeToTextmateScope(TokenType.blockComment),
    };
}

function generateLineCommentPattern(tokens: RegularToken[]): TextmatePattern {
    const tokensRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.value
    );

    return {
        begin: tokensRegex,
        end: /$/.source,
        name: TokenUtils.tokenTypeToTextmateScope(TokenType.comment),
    };
}

function generateNumberPattern(): TextmatePattern {
    return {
        match: RegExps.numberPattern.source,
        name: TokenUtils.tokenTypeToTextmateScope(TokenType.number),
    };
}

function generatePattern(
    tokens: Token[],
    tokenType: TokenType
): TextmatePattern {
    switch (tokenType) {
        case TokenType.blockComment:
            return generateBlockCommentPattern(tokens as BlockCommentToken[]);
        case TokenType.comment:
            return generateLineCommentPattern(tokens as RegularToken[]);
        case TokenType.number:
            return generateNumberPattern();
        case TokenType.operator:
            return generateBasicPattern(
                tokens as RegularToken[],
                tokenType,
                false
            );
        default:
            return generateBasicPattern(tokens as RegularToken[], tokenType);
    }
}

function generatePatternIncludes(tokens: Token[]): Record<string, string>[] {
    // Remove duplicate token types by converting to a set
    const uniqueTokenTypes: Array<TokenType> = Array.from(
        new Set(tokens.map((token) => token.type))
    );

    return uniqueTokenTypes.map((tokenType) => {
        return {
            include: `#${tokenType}`,
        };
    });
}

function generateRepository(tokens: Token[]): TextmateRepository {
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
