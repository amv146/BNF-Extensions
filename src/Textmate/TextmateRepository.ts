import { TextmatePattern } from "@/Textmate/TextmatePattern";

// Make it with Records
export type TextmateRepository = Record<
    string,
    Record<string, TextmatePattern[]>
>;
