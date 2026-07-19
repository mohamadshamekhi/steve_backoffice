export type UploadingFile = {
    file: File;
    preview: string;
    progress: number;
    uploaded: boolean;
    error?: boolean;
};

export type DropzoneProps = {
    maxSize?: number;
    accept?: { [key: string]: string[] };
    api?: string;
    hint?: string;
    containerClass?: string;
    previewClassContainer?: string;
    previewClass?: string;
};
