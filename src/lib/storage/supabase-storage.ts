import { supabaseAdmin } from "@/lib/supabase/admin";
import {
    FileStorage,
    UploadFileInput,
    UploadFileResult,
} from "./file-storage.interface";

export class SupabaseStorage implements FileStorage {
    private readonly bucket = "resumes";

    async upload(input: UploadFileInput): Promise<UploadFileResult> {
        const { file, path } = input;

        const { error } = await supabaseAdmin.storage
            .from(this.bucket)
            .upload(path, file, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            throw error;
        }

        return {
            storageRef: path,
            sizeBytes: file.size,
            mimeType: file.type,
        };
    }

    async delete(storageRef: string): Promise<void> {
        const { error } = await supabaseAdmin.storage
            .from(this.bucket)
            .remove([storageRef]);

        if (error) {
            throw error;
        }
    }

    async getSignedUrl(storageRef: string, expiresIn = 60 * 10) {
        const { data, error } = await supabaseAdmin.storage
            .from(this.bucket)
            .createSignedUrl(storageRef, expiresIn);

        if (error) {
            throw error;
        }

        return data.signedUrl;
    }
}
