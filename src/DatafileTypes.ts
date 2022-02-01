export interface datafileBoard {
    boardTitle: string;
    clusters: Map<number, datafileCluster>;
}

export interface datafileCluster {
    title?: string; // optional field
    description?: string; // optional field
    files: datafile[];
}

export interface datafile {
    title: string,
    fileType: string,
    uploader: string,
    uploadDate: Date,
    fileSize: string,
    path: string, 
}
