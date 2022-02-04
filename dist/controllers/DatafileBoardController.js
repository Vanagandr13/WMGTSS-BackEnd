"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pg_1 = require("pg");
class DatafileBoardController {
    constructor() {
        this.getBoardClusters = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const moduleName = String(request.query.moduleId);
            this.dbAPI.query('SELECT * FROM getBoardClusters($1)', [moduleName], (error, results) => {
                var _a;
                if (error) {
                    throw error;
                }
                // Now construct the sql data into json that can be delivered to the front end
                let queryResponse = [];
                // Each row of results.rows, represents a file, so loop through and add the files to our json structure. 
                for (let i = 0; i < results.rowCount; i++) {
                    let row = results.rows[i];
                    // We must also create clusters in which ot place the files, but check if a cluster already exists before adding a new cluster
                    if (!queryResponse.find(i => i.clusterId === row.clusterid)) {
                        // The cluster doesn't exist yet so let's add it.
                        let cluster = { clusterId: row.clusterid, title: row.displaytitle, description: row.clusterdescription, files: [] };
                        // add it to the cluster map
                        queryResponse.push(cluster);
                    }
                    let file = { fileId: row.fileid, title: row.filename, fileType: 'XXXXXX', uploader: row.uploader, uploadDate: new Date(row.uploaddate), fileSize: row.filesize, path: row.path };
                    (_a = queryResponse.find(i => i.clusterId === row.clusterid)) === null || _a === void 0 ? void 0 : _a.files.push(file);
                }
                console.log(queryResponse);
                response.status(200).json(queryResponse);
            });
        });
        // initialize the DB API
        this.dbAPI = new pg_1.Pool({
            user: 'student',
            host: 'localhost',
            database: 'datafiledb',
            password: 'student',
            port: 5432
        });
    }
}
module.exports = new DatafileBoardController();
//# sourceMappingURL=DatafileBoardController.js.map