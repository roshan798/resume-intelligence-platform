import { JobDescriptionRepository } from "../repositories/job-description.repository";

export class DeleteJobDescriptionService {
    private readonly repository = new JobDescriptionRepository();

    async execute(id: string, userId: string) {
        const state = await this.repository.findDeletionState(id, userId);

        if (!state) return null;

        const linked = state.snapshots.some(
            ({ _count }) =>
                _count.matchResults > 0 ||
                _count.resumeVersions > 0 ||
                _count.applications > 0 ||
                _count.aiSuggestions > 0,
        );

        if (linked) {
            throw new Error(
                "This job description cannot be deleted because a snapshot is linked to matches, resumes, applications, or AI suggestions. Archive it instead.",
            );
        }

        await this.repository.deleteWithSnapshots(id);
        return { deletedId: id };
    }
}
