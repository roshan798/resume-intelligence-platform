export interface UploadFileInput {
    path: string;
    file: File;
    contentType?: string;
}

export interface UploadFileResult {
    storageRef: string;
    sizeBytes: number;
    mimeType: string;
}

export interface FileStorage {
    upload(input: UploadFileInput): Promise<UploadFileResult>;

    delete(storageRef: string): Promise<void>;

    getSignedUrl(storageRef: string, expiresIn?: number): Promise<string>;
}
