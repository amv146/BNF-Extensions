import { TextmateRepository } from "@/Textmate/TextmateRepository";

export interface TextmateFile {
    $schema: string;
    name: string;
    patterns: Record<string, string>[];
    repository: TextmateRepository;
    scopeName: string;
}
