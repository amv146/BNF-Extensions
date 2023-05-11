export enum TokenType {
    blockComment = "blockComment",
    character = "character",
    comment = "comment",
    constant = "constant",
    function = "function",
    keyword = "keyword",
    number = "number",
    operator = "operator",
    punctuation = "punctuation",
    separator = "separator",
    string = "string",
    terminator = "terminator",
    type = "type",
}

export const tokenOrder: TokenType[] = [
    TokenType.blockComment,
    TokenType.comment,
    TokenType.constant,
    TokenType.string,
    TokenType.character,
    TokenType.number,
    TokenType.function,
    TokenType.keyword,
    TokenType.operator,
    TokenType.punctuation,
    TokenType.separator,
    TokenType.terminator,
    TokenType.type,
];

export interface BlockCommentToken {
    /**
     * The type of token. This should be `TokenType.blockComment`.
     */
    type: TokenType.blockComment;
    /**
     * The string that starts the block comment.
     */
    begin: string;
    /**
     * The string that ends the block comment.
     */
    end: string;
}

export interface RegularToken {
    /**
     * The type of token. This should be one of the `TokenType` enum values except for `TokenType.blockComment`.
     */
    type: Exclude<TokenType, TokenType.blockComment>;
    /**
     * The value of the token. This should be a string that will be highlighted as the `type` of the token.
     */
    value: string;
}

export type Token = BlockCommentToken | RegularToken;
