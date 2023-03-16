export enum TokenType {
    blockComment = "blockComment",
    character = "character",
    comment = "comment",
    constant = "constant",
    function = "function",
    keyword = "keyword",
    number = "number",
    operator = "operator",
    string = "string",
    type = "type",
}

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
