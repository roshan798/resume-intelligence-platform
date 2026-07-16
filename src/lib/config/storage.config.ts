import { Config as env } from "./index";

export const StorageConfig = {
    bucketName: env.SUPABASE_STORAGE_BUCKET,

    maxUploadSizeMb: env.MAX_UPLOAD_SIZE_MB,
};
