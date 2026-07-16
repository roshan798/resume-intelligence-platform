import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // The Prisma CLI will use this direct connection string for running migrations
        url: process.env["DIRECT_URL"],
    },
});
