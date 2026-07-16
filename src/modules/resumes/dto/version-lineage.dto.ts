export interface VersionLineageDto {
    id: string;
    versionNumber: number;
    status: string;
    parentVersionId?: string | null;
    createdAt: Date;
}
