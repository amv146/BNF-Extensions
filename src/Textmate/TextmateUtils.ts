import * as RegExpUtils from "@/RegExpUtils";
import * as RegExps from "@/RegExps";
import * as Strings from "@/Strings";
import * as TokenUtils from "@/Tokens/TokenUtils";
import { TextmateFile } from "@/Textmate/TextmateFile";
import { TextmatePattern } from "@/Textmate/TextmatePattern";
import { TextmateRepository } from "@/Textmate/TextmateRepository";
import { TextmateScope } from "@/Textmate/TextmateScope";
import {
    BlockCommentToken,
    RegularToken,
    Token,
    TokenType,
} from "@/Tokens/Token";

/**
 * @param tokens The tokens to create the TextMate grammar file for.
 * @param languageName The name of the language the tokens are for.
 * @param languageId The ID of the language the tokens are for.
 * @returns A TextMate grammar file as an interface.
 */
export function createTextmate(
    tokens: Token[],
    languageName: string,
    languageId: string
): TextmateFile {
    /**
     * In TextMate files, the order of the patterns matters. Patterns that
     * appear first in the file take precedence over patterns that appear
     * later in the file. The order of the patterns is currently predefined.
     */
    tokens = TokenUtils.sortTokens(tokens);

    const textmate: TextmateFile = {
        $schema: Strings.textmateLanguageSchema,
        name: languageName,
        patterns: createPatternIncludes(tokens),
        repository: createRepository(tokens),
        scopeName: Strings.scopePrefix + languageId,
    };

    return textmate;
}

/**
 * Creates a basic pattern for tokens of a specific type. Most tokens follow
 * the RegEx pattern of either
 * 1. `token1|token2|token3|...` (when the token value does not start with an alpha character)
 * 2. `\b(token1|token2|token3|...)\b` (when the token value starts with an alpha character)
 * This function creates a pattern for tokens that follow this pattern.
 * @param tokens The basic tokens all of the same type to create a TextMate pattern for.
 * @param tokenType The type of the tokens.
 * @returns A TextMate pattern for the basic tokens.
 */
function createBasicPattern(
    tokens: RegularToken[],
    tokenType: TokenType
): TextmatePattern {
    const wordBoundaryTokens: RegularToken[] = tokens.filter((token) =>
        needsWordBoundary(token)
    );

    const nonWordBoundaryTokens: RegularToken[] = tokens.filter(
        (token) => !needsWordBoundary(token)
    );

    let wordBoundaryRegex: string = "";
    let nonWordBoundaryRegex: string = "";

    if (wordBoundaryTokens.length > 0) {
        wordBoundaryRegex = RegExpUtils.addWordBoundaries(
            createJoinedTokenRegex(wordBoundaryTokens, (token) => token.value)
        );
    }

    if (nonWordBoundaryTokens.length > 0) {
        nonWordBoundaryRegex = createJoinedTokenRegex(
            nonWordBoundaryTokens,
            (token) => token.value
        );
    }

    if (wordBoundaryRegex.length > 0 && nonWordBoundaryRegex.length > 0) {
        wordBoundaryRegex += "|";
    }

    return {
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
        match: wordBoundaryRegex + nonWordBoundaryRegex,
    };
}

/**
 * @param tokens The block comment tokens defined in the config file.
 * @returns The TextMate pattern that matches block comments.
 */
function createBlockCommentPattern(
    tokens: BlockCommentToken[]
): TextmatePattern {
    const beginRegex: string = createJoinedTokenRegex(
        tokens,
        (token) => token.begin
    );

    const endRegex: string = createJoinedTokenRegex(
        tokens,
        (token) => token.end
    );

    return {
        begin: beginRegex,
        end: endRegex,
        name: TokenUtils.tokenTypeToTextmateScope(TokenType.blockComment),
    };
}

/**
 * @param tokens The tokens to join together.
 * @param tokenPropertyCallback A callback that returns the value of the token to join.
 * @returns A regex that matches any of the tokens.
 */
function createJoinedTokenRegex<T extends Token>(
    tokens: T[],
    tokenValueCallback: (token: T) => string
): string {
    return tokens
        .map((token) => RegExpUtils.escapeRegex(tokenValueCallback(token)))
        .join("|");
}

/**
 * @param tokens The line comment tokens defined in the config file.
 * @returns The TextMate pattern that matches line comments.
 */
function createLineCommentPattern(tokens: RegularToken[]): TextmatePattern {
    const tokensRegex: string = createJoinedTokenRegex(
        tokens,
        (token) => token.value
    );

    return {
        begin: tokensRegex,
        end: /$/.source,
        name: TextmateScope.comment,
    };
}

/**
 * Creates the number pattern for the TextMate grammar file. This is created
 * when the config file has `highlightNumbers` set to `true` under the
 * `options` property.
 */
function createNumberPattern(): TextmatePattern {
    return {
        match: RegExps.numberPattern.source,
        name: TextmateScope.number,
    };
}

/**
 * @param tokens The tokens to join together to create the textmate string pattern.
 * @param tokenType The type of the tokens. This should be either `character` or `string`.
 * @returns The TextMate pattern that matches strings of the given tokens.
 */
function createStringPattern(
    tokens: RegularToken[],
    tokenType: TokenType
): TextmatePattern {
    return {
        match: RegExpUtils.matchStringRegex(tokens.map((token) => token.value))
            .source,
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
    };
}

/**
 * @param tokens The tokens of one type to create a TextMate pattern for.
 * @param tokenType The type of the tokens.
 * @returns The TextMate pattern for the tokens.
 */
function createPattern(tokens: Token[], tokenType: TokenType): TextmatePattern {
    switch (tokenType) {
        case TokenType.blockComment:
            return createBlockCommentPattern(tokens as BlockCommentToken[]);
        case TokenType.character:
        case TokenType.string:
            return createStringPattern(tokens as RegularToken[], tokenType);
        case TokenType.comment:
            return createLineCommentPattern(tokens as RegularToken[]);
        case TokenType.constant:
        case TokenType.function:
        case TokenType.keyword:
        case TokenType.type:
        case TokenType.operator:
        case TokenType.punctuation:
        case TokenType.separator:
        case TokenType.terminator:
            return createBasicPattern(tokens as RegularToken[], tokenType);
        case TokenType.number:
            return createNumberPattern();
    }
}

/**
 * @param tokens The tokens to generate the TextMate pattern includes for.
 * @returns The TextMate pattern includes for the tokens. The TextMate pattern includes are specified in the TextMate
 * grammar file by the `patterns` property. All of the patterns in the `repository` property are included in the
 * `patterns` property.
 */
function createPatternIncludes(tokens: Token[]): Record<string, string>[] {
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

/**
 *
 * @param tokens The tokens to create a TextMate repository for.
 * @returns The TextMate repository for the tokens. The TextMate repository is specified in the TextMate grammar file
 * by the `repository` property.
 */
function createRepository(tokens: Token[]): TextmateRepository {
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
            patterns: [createPattern(tokensOfType, tokenType)],
        };
    });

    return repository;
}

/**
 * Determines if a token needs a word boundary in its regex. This is true if
 * the token's value starts and ends in a letter.
 */
function needsWordBoundary(token: RegularToken): boolean {
    return token.value[0]?.match(RegExps.wordBoundaryPattern) !== null;
}
