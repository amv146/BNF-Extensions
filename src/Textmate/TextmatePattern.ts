export interface TextmatePattern {
    begin?: string;
    captures?: Record<string, string>;
    end?: string;
    match?: string;
    name: string;
}
