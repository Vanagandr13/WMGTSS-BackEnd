// External dependencies
import { Express, NextFunction, Request, Response, Router } from 'express';
import { Pool, QueryResult, QueryResultBase } from 'pg';
import * as fs from 'fs';

// Internal dependencies
import { datafile, datafileBoard, datafileCluster } from '../DatafileTypes';

class DatafileBoardController {
  dbAPI: Pool; 
  constructor() 
  {
    // initialize the DB API
    this.dbAPI = new Pool({
      user:'tutor',
      host:'localhost',
      database:'datafiledb',
      password: 'tutor',
      port: 5432
    });
  }

  getBoardClusters = async (request: Request, response: Response) => {
    const moduleName: string = String(request.query.moduleId);
    this.dbAPI.query('SELECT * FROM getBoardClusters($1)', [moduleName], (error, results) => {
      if (error) {
        console.log(error);
        response.sendStatus(500);
      }
      // Now construct the sql data into json that can be delivered to the front end
      let queryResponse: datafileCluster[] = [];
      // Each row of results.rows, represents a file, so loop through and add the files to our json structure. 
      for (let i = 0; i < results.rowCount; i++)
      {
        let row = results.rows[i];
        // We must also create clusters in which ot place the files, 
        // but check if a cluster already exists before adding a new cluster, also don't add null clusters.
        if ((row.clusterid != null) && (!queryResponse.find(i => i.clusterId === row.clusterid)))
        {
          // The cluster doesn't exist yet so let's add it.
          let cluster: datafileCluster = { clusterId: row.clusterid, title: row.displaytitle, description: row.clusterdescription, files:[] };
          // add it to the cluster map
          queryResponse.push(cluster);
        }
        if (row.fileid != null) // don't add null files
        {
          let file:datafile = {fileId: row.fileid, title: row.filename, fileType: row.filename.split('.').pop(), uploader: row.uploader, uploadDate: new Date(row.uploaddate), fileSize: row.filesize };
          queryResponse.find(i => i.clusterId === row.clusterid)?.files.push(file);
        }
      }
      console.log(queryResponse);
      response.status(200).json(queryResponse);
    });
  }

  uploadFile = async (request: Request, response: Response) =>  {
    const file = request.body;
    const date: Date = new Date()
    const uploader:string = String(request.query.accessToken).split(",")[1];
    const dateString: string = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear();
    const filePath: string = process.env.FILE_STORAGE_PATH + '\\' + file.clusterId + '\\' + file.name; 

    const base64data = file.content.replace(/^data:.*,/, '');
    fs.writeFile(filePath, base64data, 'base64', (err) => {
      if (err) {
        console.log(err);
        response.sendStatus(500);
      } else {
        // first check that the cluster exists in the db, then check that no file owned by that cluster already exists
        this.dbAPI.query('SELECT * FROM addFile($1, $2, $3, $4, $5)', [file.clusterId, file.name, "student", dateString, file.size], (error, results) => {
          if (error) {
            console.log(error);
            response.sendStatus(500);
          }

          response.status(200);
          response.send({});
        })
      }
    })
  }

  downloadFile = async (request: Request, response: Response) =>  {
    const fileId: number = Number(request.query.fileId);
    const file = request.body;
    // now check that the file exists and find it's file name
    this.dbAPI.query('SELECT * FROM getFile($1)', [fileId], (error, results) => {
      if (error) {
        console.log(error);
        response.sendStatus(500);
      }
      if (results.rows.length == 1) // check that the file exists
      {
        const filePath: string = process.env.FILE_STORAGE_PATH + '\\' + String(results.rows[0].clusterid) + '\\' + String(results.rows[0].filename);
        
        fs.readFile(filePath, (err) => {
          if (err) {
            console.log(err);
            response.sendStatus(500);
          } else {
            response.status(200);
            response.setHeader('Content-disposition', 'attachment; filename=' + results.rows[0].filename);
            response.download(filePath, results.rows[0].filename); 

          }
        });
      }
      else {
        console.log('ERROR: File not found in DB, file not downloaded.')
        response.sendStatus(500);
      }
    });
  }

  deleteFile = async (request: Request, response: Response) =>  {
    const fileId: Number = Number(request.query.fileId);
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
        const filePath: string = process.env.FILE_STORAGE_PATH + '\\' + results.rows[0].clusterid + '\\' + results.rows[0].filename;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            response.sendStatus(500);
          } else {
            response.status(200);
            response.send({});
          }
        });
      }
      else {
        console.log('ERROR: File not found in DB, file not deleted.')
        response.sendStatus(500);
      }
    });
  }

  createCluster = async (request: Request, response: Response) =>  {
    const moduleId: string = String(request.query.moduleId);
    const clusterTitle: string = String(request.body.clusterTitle);
    const clusterDescription: string = String(request.body.clusterDescription);
    this.dbAPI.query('SELECT * FROM addCluster($1, $2, $3)', [moduleId, clusterTitle, clusterDescription], (error, results) => {
      if (error) {
        console.log(error);
        response.sendStatus(500);
      }
      else {
        const dirPath: string = process.env.FILE_STORAGE_PATH + '/' + results.rows[0].clusterid;
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
  }

  modifyCluster = async (request: Request, response: Response) =>  {
    const clusterId: string = String(request.query.clusterId);
    const clusterTitle: string = String(request.body.clusterTitle);
    const clusterDescription: string = String(request.body.clusterDescription);
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
  }

  deleteCluster = async (request: Request, response: Response) =>  {
    const clusterId: string = String(request.query.clusterId);
    // now delete the cluster meta data from the database  
    this.dbAPI.query('SELECT * FROM deleteCluster($1)', [clusterId], (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results.rows.length > 0) // check that the query made a deletion 
      {
        const dirPath: string = process.env.FILE_STORAGE_PATH + '/' + results.rows[0].clusterid;
        fs.rmdir(dirPath, { recursive: true}, (err) => {
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
        console.log('ERROR: Cluster not dound in DB, cluster not deleted.')
        response.sendStatus(500);
      }
    });
  }
}

export = new DatafileBoardController();