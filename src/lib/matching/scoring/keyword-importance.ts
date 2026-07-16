export function determineImportance(
    section: "requirements" | "responsibilities" | "preferred" | "general",
) {
    switch (section) {
        case "requirements":
            return 5;

        case "responsibilities":
            return 3;

        case "preferred":
            return 1;

        default:
            return 2;
    }
}
