"use strict";
const pg_1 = require("pg");
class DatafileBoardController {
    constructor() {
        // initialize the DB API
        this.dbAPI = new pg_1.Pool({
            user: 'student',
            host: 'localhost',
            database: 'datafiledb',
            password: 'student',
            port: 5432
        });
    }
    defaultMethod() {
        const moduleName = 'maths';
        this.dbAPI.query('SELECT * FROM getBoardClusters($1)', [moduleName], (error, results) => {
            var _a;
            if (error) {
                console.log("ERROR:", error);
                throw error;
            }
            console.log(results.rows);
            // Now construct the sql data into json that can be delivered to the front end
            let jsonQueryResponse = { boardTitle: 'boardTitle_I_MustFix_This', clusters: new Map() };
            // Each row of results.rows, represents a file, so loop through and add the files to our json structure. 
            for (let i = 0; i < results.rowCount; i++) {
                let row = results.rows[i];
                // We must also create clusters in which ot place the files, but check if a luster already exists before adding a new cluster
                if (!jsonQueryResponse.clusters.has(row.clusterid)) {
                    // The cluster doesn't exist yet so let's add it.
                    let cluster = { title: row.displaytitle, description: row.clusterdescription, files: [] };
                    // add it to the cluster map
                    jsonQueryResponse.clusters.set(row.clusterid, cluster);
                }
                let file = { title: row.filename, fileType: 'XXXXXX', uploader: row.uploader, uploadDate: new Date(row.uploaddate), fileSize: row.filesize, path: row.path };
                (_a = jsonQueryResponse.clusters.get(row.clusterid)) === null || _a === void 0 ? void 0 : _a.files.push(file);
            }
            return jsonQueryResponse;
        });
    }
}
module.exports = new DatafileBoardController();
//# sourceMappingURL=DatafileBoardController.js.map