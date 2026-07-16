export class JDSectionizer {
    extract(text: string) {
        const lower = text.toLowerCase();

        return {
            requirements: this.extractBlock(lower, [
                "requirements",
                "qualifications",
                "must have",
            ]),

            responsibilities: this.extractBlock(lower, [
                "responsibilities",
                "what you'll do",
                "duties",
            ]),

            preferred: this.extractBlock(lower, [
                "preferred",
                "nice to have",
                "good to have",
            ]),

            general: lower,
        };
    }

    private extractBlock(text: string, headings: string[]) {
        const match = headings.find((heading) => text.includes(heading));

        if (!match) {
            return "";
        }

        const index = text.indexOf(match);

        return text.slice(index);
    }
}
