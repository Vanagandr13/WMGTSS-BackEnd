"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const cors_1 = __importDefault(require("cors"));
const DatafileBoardController_1 = __importDefault(require("../controllers/DatafileBoardController"));
const options = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'X-Access-Token',
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: 'http://localhost:4200',
    preflightContinue: false,
};
class DatafileBoardRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this._controller = DatafileBoardController_1.default;
        this._configure();
    }
    get router() {
        return this._router;
    }
    /**
     * Connect routes to their matching controller endpoints.
     */
    _configure() {
        this._router.use((0, cors_1.default)(options));
        this._router.get('/datafile', this._controller.getBoardClusters);
    }
}
module.exports = new DatafileBoardRouter().router;
//# sourceMappingURL=DatafileBoardRouter.js.map