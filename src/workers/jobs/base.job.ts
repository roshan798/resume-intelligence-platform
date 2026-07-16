export interface Job<T> {
    execute(payload: T): Promise<void>;
}
