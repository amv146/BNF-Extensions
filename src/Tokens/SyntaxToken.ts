export enum SyntaxTokenType {
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

export interface SyntaxBlockCommentToken {
    type: SyntaxTokenType.blockComment;
    begin: string;
    end: string;
}

export interface SyntaxRegularToken {
    type: Exclude<SyntaxTokenType, SyntaxTokenType.blockComment>;
    value: string;
}

export type SyntaxToken = SyntaxBlockCommentToken | SyntaxRegularToken;
