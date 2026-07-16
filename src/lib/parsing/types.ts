export interface ResumeSection {
    title: string;
    content: string;
}

export interface ParsedSections {
    summary: string;
    skills: string;
    experience: string[];
    projects: string[];
    education: string[];
    certifications: string[];
    others: string[];
}

export interface ParsedResume {
    rawText: string;

    sections: ParsedSections;

    sourceFormat: "PDF" | "DOCX" | "LATEX";
}
