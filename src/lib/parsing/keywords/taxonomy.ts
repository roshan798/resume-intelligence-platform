export type KeywordCategory =
    | "LANGUAGE"
    | "FRAMEWORK"
    | "DATABASE"
    | "CLOUD"
    | "DEVOPS"
    | "TOOL"
    | "MESSAGING"
    | "ARCHITECTURE"
    | "METHODOLOGY"
    | "SOFT_SKILL";

export interface SkillTaxonomyEntry {
    normalizedKeyword: string;
    displayName: string;
    category: KeywordCategory;
    aliases: readonly string[];
}

export const skillTaxonomy: readonly SkillTaxonomyEntry[] = [
    entry("java", "Java", "LANGUAGE", ["java"]),
    entry("javascript", "JavaScript", "LANGUAGE", ["javascript"]),
    entry("typescript", "TypeScript", "LANGUAGE", ["typescript"]),
    entry("python", "Python", "LANGUAGE", ["python"]),
    entry("csharp", "C#", "LANGUAGE", ["c#", "c sharp"]),
    entry("cplusplus", "C++", "LANGUAGE", ["c++", "c plus plus"]),
    entry("golang", "Go", "LANGUAGE", ["golang"]),
    entry("kotlin", "Kotlin", "LANGUAGE", ["kotlin"]),
    entry("rust", "Rust", "LANGUAGE", ["rust"]),
    entry("sql", "SQL", "LANGUAGE", ["sql"]),
    entry("nodejs", "Node.js", "FRAMEWORK", ["node.js", "nodejs", "node js", "node"]),
    entry("react", "React", "FRAMEWORK", ["react.js", "reactjs", "react"]),
    entry("nextjs", "Next.js", "FRAMEWORK", ["next.js", "nextjs", "next js"]),
    entry("angular", "Angular", "FRAMEWORK", ["angular"]),
    entry("vue", "Vue.js", "FRAMEWORK", ["vue.js", "vuejs", "vue"]),
    entry("express", "Express", "FRAMEWORK", ["express.js", "expressjs", "express"]),
    entry("nestjs", "NestJS", "FRAMEWORK", ["nestjs", "nest.js", "nest js"]),
    entry("spring_boot", "Spring Boot", "FRAMEWORK", ["spring boot", "springboot"]),
    entry("spring_security", "Spring Security", "FRAMEWORK", ["spring security"]),
    entry("dotnet", ".NET", "FRAMEWORK", [".net", "dotnet"]),
    entry("tailwind_css", "Tailwind CSS", "FRAMEWORK", ["tailwind css", "tailwindcss", "tailwind"]),
    entry("zustand", "Zustand", "FRAMEWORK", ["zustand"]),
    entry("redux", "Redux", "FRAMEWORK", ["redux", "redux toolkit"]),
    entry("postgresql", "PostgreSQL", "DATABASE", ["postgresql", "postgres"]),
    entry("mysql", "MySQL", "DATABASE", ["mysql"]),
    entry("mongodb", "MongoDB", "DATABASE", ["mongodb", "mongo"]),
    entry("redis", "Redis", "DATABASE", ["redis"]),
    entry("elasticsearch", "Elasticsearch", "DATABASE", ["elasticsearch", "elastic search"]),
    entry("dynamodb", "DynamoDB", "DATABASE", ["dynamodb", "dynamo db"]),
    entry("aws", "AWS", "CLOUD", ["amazon web services", "aws"]),
    entry("azure", "Azure", "CLOUD", ["microsoft azure", "azure"]),
    entry("gcp", "Google Cloud", "CLOUD", ["google cloud platform", "google cloud", "gcp"]),
    entry("docker", "Docker", "DEVOPS", ["docker", "containers"]),
    entry("kubernetes", "Kubernetes", "DEVOPS", ["kubernetes", "k8s"]),
    entry("cicd", "CI/CD", "DEVOPS", ["ci/cd", "continuous integration", "continuous delivery"]),
    entry("github_actions", "GitHub Actions", "DEVOPS", ["github actions"]),
    entry("jenkins", "Jenkins", "DEVOPS", ["jenkins"]),
    entry("terraform", "Terraform", "DEVOPS", ["terraform"]),
    entry("git", "Git", "TOOL", ["git"]),
    entry("github", "GitHub", "TOOL", ["github"]),
    entry("prisma", "Prisma", "TOOL", ["prisma"]),
    entry("mongoose", "Mongoose", "TOOL", ["mongoose"]),
    entry("kafka", "Kafka", "MESSAGING", ["apache kafka", "kafka"]),
    entry("rabbitmq", "RabbitMQ", "MESSAGING", ["rabbitmq", "rabbit mq"]),
    entry("rest_api", "REST APIs", "ARCHITECTURE", ["restful api", "rest api", "restful services"]),
    entry("graphql", "GraphQL", "ARCHITECTURE", ["graphql"]),
    entry("microservices", "Microservices", "ARCHITECTURE", ["microservices", "microservice architecture"]),
    entry("event_driven", "Event-driven architecture", "ARCHITECTURE", ["event-driven architecture", "event driven architecture"]),
    entry("api_gateway", "API Gateway", "ARCHITECTURE", ["api gateway", "api gateways"]),
    entry("kong", "Kong", "TOOL", ["kong"]),
    entry("orm", "ORM", "ARCHITECTURE", ["object relational mapping", "orm", "orms"]),
    entry("odm", "ODM", "ARCHITECTURE", ["object document mapping", "odm", "odms"]),
    entry("agile", "Agile", "METHODOLOGY", ["agile"]),
    entry("scrum", "Scrum", "METHODOLOGY", ["scrum"]),
    entry("problem_solving", "Problem solving", "SOFT_SKILL", ["problem-solving", "problem solving"]),
    entry("communication", "Communication", "SOFT_SKILL", ["communication skills", "clear communication"]),
    entry("collaboration", "Collaboration", "SOFT_SKILL", ["collaboration", "collaborate"]),
];

function entry(
    normalizedKeyword: string,
    displayName: string,
    category: KeywordCategory,
    aliases: readonly string[],
): SkillTaxonomyEntry {
    return { normalizedKeyword, displayName, category, aliases };
}
