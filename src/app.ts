// external dependencies
import dotenv from 'dotenv';
import express from 'express';
import BodyParser from 'body-parser';

//internal dependencies
import DatafileBoardRouter from './routers/DatafileBoardRouter';

// load the environment variables from the .env file
dotenv.config({
  path: '.env'
});

/**
 * Express server application class.
 * @description Will later contain the routing system.
 */
class Server {
  public app = express();
  public router = DatafileBoardRouter;


}

// initialize server app
const server = new Server();

server.app.use('/api', server.router);
//server.app.use('/api', express.static(process.env.FILE_STORAGE_PATH!));
server.app.use(BodyParser.urlencoded({ extended: true, limit: '50mb'}));
server.app.use(BodyParser.json({limit: '50mb'}));

server.app.get('/', (req, res) => {
  res.send('Hello World!');
});

// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
  server.app.listen(port, () => console.log(`> Listening on port ${port}`));
})();