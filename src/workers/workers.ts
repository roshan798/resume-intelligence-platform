import "./processors/resume.processor";
import "./processors/ai.processor";
import "./processors/match.processor";

console.log("====================================");
console.log("Resume Intelligence Workers Started");
console.log("====================================");

process.on("SIGINT", async () => {
    console.log("Shutting down workers...");

    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down workers...");

    process.exit(0);
});
