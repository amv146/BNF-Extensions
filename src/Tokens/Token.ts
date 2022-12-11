import { TextmateScope } from "../Textmate/TextmateScope";

export enum TokenType {
    comment = "comment",
    constant = "constant",
    function = "function",
    keyword = "keyword",
    operator = "operator",
}

export interface Token {
    name: string;
    type: TokenType;
    textmateScope: TextmateScope;
}
