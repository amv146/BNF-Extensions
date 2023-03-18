import * as RegExpUtils from "@/RegExpUtils";
import * as RegExps from "@/RegExps";
import { Pattern, RegularPattern } from "@/Tokens/Pattern";
import { CommentToken, RegularToken, Token, TokenType } from "@/Tokens/Token";

function generateJoinedTokenRegex<T extends Token>(
    tokens: T[],
    tokenPropertyCallback: (token: T) => string
): string {
    return tokens
        .map((token) => RegExpUtils.escapeRegex(tokenPropertyCallback(token)))
        .join("|");
}

// Assure that tokens is not empty
function generateBasicPattern<T extends RegularToken>(
    tokens: T[],
    tokenType: RegularPattern["type"],
    wordBoundary?: boolean
): RegularPattern {
    const tokensRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.value
    );

    return {
        type: tokenType,
        match: wordBoundary ? `\\b(${tokensRegex})\\b` : tokensRegex,
    };
}

function generateBlockCommentPattern(tokens: CommentToken[]): Pattern {
    const beginRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.begin
    );

    const endRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.end
    );

    return {
        type: TokenType.blockComment,
        begin: beginRegex,
        end: endRegex,
    };
}

function generateCharacterPattern(): Pattern {
    return {
        type: TokenType.character,
        match: RegExps.characterPattern.source,
    };
}

function generateLineCommentPattern(tokens: RegularToken[]): Pattern {
    const tokensRegex: string = generateJoinedTokenRegex(
        tokens,
        (token) => token.value
    );

    return {
        type: TokenType.comment,
        begin: tokensRegex,
        end: /$/.source,
    };
}

function generateNumberPattern(): Pattern {
    return {
        type: TokenType.number,
        match: RegExps.numberPattern.source,
    };
}

function generateStringPattern(): Pattern {
    return {
        type: TokenType.string,
        match: RegExps.stringPattern.source,
    };
}

export function generatePattern(
    tokens: Token[],
    tokenType: TokenType
): Pattern {
    switch (tokenType) {
        case TokenType.blockComment:
            return generateBlockCommentPattern(tokens as CommentToken[]);
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
        case TokenType.string:
            return generateStringPattern();
        case TokenType.character:
            return generateCharacterPattern();
        default:
            return generateBasicPattern(tokens as RegularToken[], tokenType);
    }
}
