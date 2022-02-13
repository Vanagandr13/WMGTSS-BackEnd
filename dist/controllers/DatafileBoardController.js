"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
class DatafileBoardController {
    constructor() {
        this.getBoardClusters = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const moduleName = String(request.query.moduleId);
            this.dbAPI.query('SELECT * FROM getBoardClusters($1)', [moduleName], (error, results) => {
                var _a;
                if (error) {
                    console.log(error);
                    response.sendStatus(500);
                }
                // Now construct the sql data into json that can be delivered to the front end
                let queryResponse = [];
                // Each row of results.rows, represents a file, so loop through and add the files to our json structure. 
                for (let i = 0; i < results.rowCount; i++) {
                    let row = results.rows[i];
                    // We must also create clusters in which ot place the files, 
                    // but check if a cluster already exists before adding a new cluster, also don't add null clusters.
                    if ((row.clusterid != null) && (!queryResponse.find(i => i.clusterId === row.clusterid))) {
                        // The cluster doesn't exist yet so let's add it.
                        let cluster = { clusterId: row.clusterid, title: row.displaytitle, description: row.clusterdescription, files: [] };
                        // add it to the cluster map
                        queryResponse.push(cluster);
                    }
                    if (row.fileid != null) // don't add null files
                     {
                        let file = { fileId: row.fileid, title: row.filename, fileType: row.filename.split('.').pop(), uploader: row.uploader, uploadDate: row.uploaddate, fileSize: row.filesize, downloadCounter: row.downloadcounter };
                        (_a = queryResponse.find(i => i.clusterId === row.clusterid)) === null || _a === void 0 ? void 0 : _a.files.push(file);
                    }
                }
                console.log(queryResponse);
                response.status(200).json(queryResponse);
            });
        });
        this.uploadFile = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const file = request.body;
            const date = new Date();
            const uploader = String(request.query.accessToken).split(",")[1];
            const dateString = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear();
            const filePath = process.env.FILE_STORAGE_PATH + '\\' + file.clusterId + '\\' + file.name;
            const base64data = file.content.replace(/^data:.*,/, '');
            fs.writeFile(filePath, base64data, 'base64', (err) => {
                if (err) {
                    console.log(err);
                    response.sendStatus(500);
                }
                else {
                    // If file can be written to the storage system, find its size stat and then add the file to the metadatabase
                    fs.stat(filePath, (err, stats) => {
                        if (err) {
                            console.log(err);
                            response.sendStatus(500);
                        }
                        else {
                            // first check that the cluster exists in the db, then check that no file owned by that cluster already exists
                            this.dbAPI.query('SELECT * FROM addFile($1, $2, $3, $4, $5, $6)', [file.clusterId, file.name, uploader, dateString, getDisplayFileSize(stats.size), 0], (error, results) => {
                                if (error) {
                                    console.log(error);
                                    response.sendStatus(500);
                                }
                                else {
                                    response.status(200);
                                    response.send({});
                                }
                            });
                        }
                    });
                }
            });
        });
        this.downloadFile = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const fileId = Number(request.query.fileId);
            const file = request.body;
            // now check that the file exists and find it's file name
            this.dbAPI.query('SELECT * FROM getFile($1)', [fileId], (error, results) => {
                if (error) {
                    console.log(error);
                    response.sendStatus(500);
                }
                if (results.rows.length == 1) // check that the file exists
                 {
                    const filePath = process.env.FILE_STORAGE_PATH + '\\' + String(results.rows[0].clusterid) + '\\' + String(results.rows[0].filename);
                    const fileName = results.rows[0].filename;
                    fs.readFile(filePath, (err) => {
                        if (err) {
                            console.log(err);
                            response.sendStatus(500);
                        }
                        else {
                            this.dbAPI.query('SELECT * FROM incramentFileDownloadCounter($1)', [fileId], (error, results) => {
                                if (error) {
                                    console.log(error);
                                    response.sendStatus(500);
                                }
                                else {
                                    response.status(200);
                                    response.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                                    response.download(filePath, fileName);
                                }
                            });
                        }
                    });
                }
                else {
                    console.log('ERROR: File not found in DB, file not downloaded.');
                    response.sendStatus(500);
                }
            });
        });
        this.deleteFile = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const fileId = Number(request.query.fileId);
            // Now delete the file from the meta database. 
            // If the file is found in the DB, its meta data will be deleted, 
            // and the query will return the deleted data so that the file can also be deleted. 
            this.dbAPI.query('SELECT * FROM deleteFile($1)', [fileId], (error, results) => {
                if (error) {
                    console.log(error);
                    response.sendStatus(500);
                }
                if (results.rows.length > 0) // check that the query made a deletion 
                 {
                    const filePath = process.env.FILE_STORAGE_PATH + '\\' + results.rows[0].clusterid + '\\' + results.rows[0].filename;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log(err);
                            response.sendStatus(500);
                        }
                        else {
                            response.status(200);
                            response.send({});
                        }
                    });
                }
                else {
                    console.log('ERROR: File not found in DB, file not deleted.');
                    response.sendStatus(500);
                }
            });
        });
        this.createCluster = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const moduleId = String(request.query.moduleId);
            const clusterTitle = String(request.body.clusterTitle);
            const clusterDescription = String(request.body.clusterDescription);
            this.dbAPI.query('SELECT * FROM addCluster($1, $2, $3)', [moduleId, clusterTitle, clusterDescription], (error, results) => {
                if (error) {
                    console.log(error);
                    response.sendStatus(500);
                }
                else {
                    const dirPath = process.env.FILE_STORAGE_PATH + '/' + results.rows[0].clusterid;
                    fs.mkdir(dirPath, { recursive: true }, (err) => {
                        if (err) {
                            console.log(err);
                            response.sendStatus(500);
                        }
                        else {
                            response.status(200);
                            response.send({});
                        }
                    });
                }
            });
        });
        this.modifyCluster = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const clusterId = String(request.query.clusterId);
            const clusterTitle = String(request.body.clusterTitle);
            const clusterDescription = String(request.body.clusterDescription);
            this.dbAPI.query('SELECT * FROM modifyCluster($1, $2, $3)', [clusterId, clusterTitle, clusterDescription], (error) => {
                if (error) {
                    console.log(error);
                    response.sendStatus(500);
                }
                else {
                    response.status(200);
                    response.send({});
                }
            });
        });
        this.deleteCluster = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const clusterId = String(request.query.clusterId);
            // now delete the cluster meta data from the database  
            this.dbAPI.query('SELECT * FROM deleteCluster($1)', [clusterId], (error, results) => {
                if (error) {
                    console.log(error);
                }
                if (results.rows.length > 0) // check that the query made a deletion 
                 {
                    const dirPath = process.env.FILE_STORAGE_PATH + '/' + results.rows[0].clusterid;
                    fs.rmdir(dirPath, { recursive: true }, (err) => {
                        if (err) {
                            console.log(err);
                            response.sendStatus(500);
                        }
                        else {
                            response.status(200);
                            response.send({});
                        }
                    });
                }
                else {
                    console.log('ERROR: Cluster not dound in DB, cluster not deleted.');
                    response.sendStatus(500);
                }
            });
        });
        // initialize the DB API
        this.dbAPI = new pg_1.Pool({
            user: 'tutor',
            host: 'localhost',
            database: 'datafiledb',
            password: 'tutor',
            port: 5432
        });
    }
}
function getDisplayFileSize(size) {
    const gigabyte = 1024 * 1024 * 1024;
    const megabyte = 1024 * 1024;
    const kilobyte = 1024;
    if (size > gigabyte) {
        return String((size / gigabyte).toFixed(2)) + 'GB';
    }
    else if (size > megabyte) {
        return String((size / megabyte).toFixed(2)) + 'MB';
    }
    else if (size > kilobyte) {
        return String((size / kilobyte).toFixed(2)) + 'KB';
    }
    else {
        return String(size) + 'B';
    }
}
module.exports = new DatafileBoardController();
//# sourceMappingURL=DatafileBoardController.js.map