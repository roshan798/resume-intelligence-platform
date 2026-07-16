export interface Queue {
    add(jobName: string, payload: unknown): Promise<void>;
}
