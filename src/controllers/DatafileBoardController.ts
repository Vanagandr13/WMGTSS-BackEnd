// External dependencies
import { response } from 'express';
import { request } from 'express';
import { Pool } from 'pg';

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

    defaultMethod() {
      const moduleName: string = 'maths';
      this.dbAPI.query('SELECT * FROM getBoardClusters($1)', [moduleName], (error, results) => {
        if (error) {
          console.log("ERROR:", error);
          throw error;
        }

        console.log(results.rows);

        // Now construct the sql data into json that can be delivered to the front end
        let jsonQueryResponse: datafileBoard = { boardTitle: 'boardTitle_I_MustFix_This', clusters: new Map<number, datafileCluster>()};
        
        // Each row of results.rows, represents a file, so loop through and add the files to our json structure. 
        for (let i = 0; i < results.rowCount; i++)
        {
          let row = results.rows[i];

          // We must also create clusters in which ot place the files, but check if a luster already exists before adding a new cluster
          if (!jsonQueryResponse.clusters.has(row.clusterid))
          {
            // The cluster doesn't exist yet so let's add it.
            let cluster: datafileCluster = { title: row.displaytitle, description: row.clusterdescription, files:[] };

            // add it to the cluster map
            jsonQueryResponse.clusters.set(row.clusterid, cluster);
          }

          let file:datafile = { title: row.filename, fileType: 'XXXXXX', uploader: row.uploader, uploadDate: new Date(row.uploaddate), fileSize: row.filesize, path: row.path }

          jsonQueryResponse.clusters.get(row.clusterid)?.files.push(file)
        }

        return jsonQueryResponse;
      })
    }
  }
  
  export = new DatafileBoardController();