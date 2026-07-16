export interface FileStorage {
    upload(path: string, file: File): Promise<string>;

    delete(path: string): Promise<void>;

    getPublicUrl(path: string): Promise<string>;
}
