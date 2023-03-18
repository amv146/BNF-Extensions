import * as Strings from "@/Strings";
import * as PatternUtils from "@/Tokens/PatternUtils";
import * as TokenUtils from "@/Tokens/TokenUtils";
import { TextmateFile } from "@/Textmate/TextmateFile";
import { TextmatePattern } from "@/Textmate/TextmatePattern";
import { TextmateRepository } from "@/Textmate/TextmateRepository";
import { Token, TokenType } from "@/Tokens/Token";

export function generateTextmate(
    tokens: Token[],
    languageName: string,
    languageId: string
): TextmateFile {
    const textmate: TextmateFile = {
        $schema: Strings.textmateLanguageSchema,
        name: languageName,
        patterns: generatePatternIncludes(tokens),
        repository: generateRepository(tokens),
        scopeName: "source." + languageId,
    };

    return textmate;
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
    const tokensByType: Map<TokenType, Token[]> =
        TokenUtils.groupTokensByType(tokens);

    tokensByType.forEach((tokensOfType, tokenType) => {
        repository[tokenType] = {
            patterns: [generateTextmatePattern(tokensOfType, tokenType)],
        };
    });

    return repository;
}

function generateTextmatePattern(
    tokens: Token[],
    tokenType: TokenType
): TextmatePattern {
    const textmatePattern: TextmatePattern = {
        ...PatternUtils.generatePattern(tokens, tokenType),
        name: TokenUtils.tokenTypeToTextmateScope(tokenType),
    };

    return textmatePattern;
}
