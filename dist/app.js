"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// external dependencies
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
//internal dependencies
const MasterRouter_1 = __importDefault(require("./routers/MasterRouter"));
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
        this.router = MasterRouter_1.default;
    }
}
// initialize server app
const server = new Server();
server.app.use('/api', server.router);
server.app.get('/', (req, res) => {
    res.send('Hello World!');
});
// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
    server.app.listen(port, () => console.log(`> Listening on port ${port}`));
})();
//# sourceMappingURL=app.js.map