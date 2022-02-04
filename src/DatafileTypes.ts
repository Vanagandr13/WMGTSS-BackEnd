export interface datafileBoard {
    boardTitle: string;
    clusters: datafileCluster[];
}

export interface datafileCluster {
    clusterId: number;
    title?: string; // optional field
    description?: string; // optional field
    files: datafile[];
    //displayOrdering: number;
}

export interface datafile {
    fileId: number;
    title: string,
    fileType: string,
    uploader: string,
    uploadDate: Date,
    fileSize: string,
    path: string,
   // displayOrdering: number; // used by the display order files 
}
