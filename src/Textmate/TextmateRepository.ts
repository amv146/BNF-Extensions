import { TokenType } from "../Tokens/Token";
import { TextmatePattern } from "./TextmatePattern";

export interface TextmateRepository {
    [ruleName: string]: { [patterns: string]: TextmatePattern[] };
}
