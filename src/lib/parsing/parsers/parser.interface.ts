import { ParsedResume } from "../types";

export interface ResumeParser {
    parse(fileBuffer: Buffer): Promise<ParsedResume>;
}
