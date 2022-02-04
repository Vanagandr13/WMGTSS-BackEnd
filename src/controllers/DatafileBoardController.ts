// External dependencies
import { NextFunction, Request, Response, Router } from 'express';
import { Pool, QueryResult } from 'pg';

// Internal dependencies
import { datafile, datafileBoard, datafileCluster } from '../DatafileTypes';

class DatafileBoardController {
  dbAPI: Pool; 
  constructor()
  {
    // initialize the DB API
    this.dbAPI = new Pool({
      user:'student',
      host:'localhost',
      database:'datafiledb',
      password: 'student',
      port: 5432
    });
  }

  getBoardClusters = async (request: Request, response: Response) => {
    const moduleName: string = String(request.query.moduleId);
    this.dbAPI.query('SELECT * FROM getBoardClusters($1)', [moduleName], (error, results) => {
      if (error) {
        throw error
      }
      // Now construct the sql data into json that can be delivered to the front end
      let queryResponse: datafileCluster[] = [];
      // Each row of results.rows, represents a file, so loop through and add the files to our json structure. 
      for (let i = 0; i < results.rowCount; i++)
      {
        let row = results.rows[i];
        // We must also create clusters in which ot place the files, but check if a cluster already exists before adding a new cluster
        if (!queryResponse.find(i => i.clusterId === row.clusterid))
        {
          // The cluster doesn't exist yet so let's add it.
          let cluster: datafileCluster = { clusterId: row.clusterid, title: row.displaytitle, description: row.clusterdescription, files:[] };
          // add it to the cluster map
          queryResponse.push(cluster);
        }
        let file:datafile = {fileId: row.fileid, title: row.filename, fileType: 'XXXXXX', uploader: row.uploader, uploadDate: new Date(row.uploaddate), fileSize: row.filesize, path: row.path }
        queryResponse.find(i => i.clusterId === row.clusterid)?.files.push(file)
      }
      console.log(queryResponse);
      response.status(200).json(queryResponse);
    })
  }
}

  
  export = new DatafileBoardController();