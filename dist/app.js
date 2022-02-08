"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// external dependencies
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
//internal dependencies
const DatafileBoardRouter_1 = __importDefault(require("./routers/DatafileBoardRouter"));
// load the environment variables from the .env file
dotenv_1.default.config({
    path: '.env'
});
/**
 * Express server application class.
 * @description Will later contain the routing system.
 */
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.router = DatafileBoardRouter_1.default;
    }
}
// initialize server app
const server = new Server();
server.app.use('/api', server.router);
//server.app.use('/api', express.static(process.env.FILE_STORAGE_PATH!));
server.app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
server.app.use(body_parser_1.default.json({ limit: '50mb' }));
server.app.get('/', (req, res) => {
    res.send('Hello World!');
});
// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
    server.app.listen(port, () => console.log(`> Listening on port ${port}`));
})();
//# sourceMappingURL=app.js.map