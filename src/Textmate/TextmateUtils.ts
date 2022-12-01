import * as Strings from "../Strings";
import * as TokenUtils from "../Tokens/TokenUtils";
import { Token, TokenType } from "../Tokens/Token";
import { TextmatePattern } from "./TextmatePattern";

export function generateTextmateJson(
    tokens: Token[],
    languageName: string
): string {
    const scopeNameRegex: RegExp = new RegExp(
        `^${escapeRegex(languageName)}\\.(.*)$`
    );

    const scopeName: string = languageName.toLowerCase();

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
): { [key: string]: string }[] {
    let patternIncludes: { [key: string]: string }[] = [];

    const tokenTypes = new Set(tokens.map((token) => token.type));

    for (const tokenType of tokenTypes) {
        patternIncludes.push({
            include: `#${tokenType}`,
        });
    }

    return patternIncludes;
}

export function generateRepository(tokens: Token[]): {
    [ruleName: string]: { [patterns: string]: TextmatePattern[] };
} {
    const repository: {
        [ruleName: string]: { [patterns: string]: TextmatePattern[] };
    } = {};

    const tokensByType: Map<TokenType, Token[]> = new Map();

    tokens.forEach((token) => {
        const tokensOfType = tokensByType.get(token.type) ?? [];

        tokensOfType.push(token);

        tokensByType.set(token.type, tokensOfType);
    });

    for (const [tokenType, tokensOfType] of tokensByType) {
        const tokensRegex: string = tokensOfType
            .map((token) => escapeRegex(token.name))
            .join("|");

        repository[tokenType] = {
            patterns: [
                {
                    name: TokenUtils.tokenTypeToTextmateScope(tokenType),
                    match: "\\b(" + tokensRegex + ")\\b",
                },
            ],
        };
    }

    return repository;
}

function escapeRegex(string: String): string {
    return string.replace(/[-[\]{}()*+?.,^$|#\s]/g, "\\$&");
}
