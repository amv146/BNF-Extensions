import { TextmatePattern } from "@/Textmate/TextmatePattern";

// Make it with Records
export interface TextmateRepository {
    [ruleName: string]: { [patterns: string]: TextmatePattern[] };
}
