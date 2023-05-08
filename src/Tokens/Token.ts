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
    type: TokenType.blockComment;
    begin: string;
    end: string;
}

export interface RegularToken {
    type: Exclude<TokenType, TokenType.blockComment>;
    value: string;
}

export type Token = BlockCommentToken | RegularToken;
