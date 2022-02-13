export interface datafileCluster {
    clusterId: number;
    title?: string; // optional field
    description?: string; // optional field
    files: datafile[];
}

export interface datafile {
    fileId: number;
    title: string,
    fileType: string,
    uploader: string,
    uploadDate: string,
    fileSize: string,
    downloadCounter: number
}
