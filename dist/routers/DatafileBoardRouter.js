"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const DatafileBoardController_1 = __importDefault(require("../controllers/DatafileBoardController"));
const RequestValidator_1 = require("../RequestValidator");
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
        this._router.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
        this._router.use(body_parser_1.default.json({ limit: '50mb' }));
        this._router.use('/file', express_2.default.static('C:\\WMGTSS_FileStorage')); // do we need this?? XXXXXXXXXXXXXXXXXXXXXXXXX
        // intercepts incoming packets to check they contain a valid token
        this._router.use('/datafile', function (request, response, next) {
            if ((0, RequestValidator_1.validateRequest)(request, ['Student', 'Tutor'])) {
                next();
            }
            else {
                response.sendStatus(401);
            }
        });
        this._router.use('/file/upload', function (request, response, next) {
            if ((0, RequestValidator_1.validateRequest)(request, ['Tutor'])) {
                next();
            }
            else {
                response.sendStatus(401);
            }
        });
        this._router.use('/file/download', function (request, response, next) {
            if ((0, RequestValidator_1.validateRequest)(request, ['Student', 'Tutor'])) {
                next();
            }
            else {
                response.sendStatus(401);
            }
        });
        this._router.use('/file/delete', function (request, response, next) {
            if ((0, RequestValidator_1.validateRequest)(request, ['Tutor'])) {
                next();
            }
            else {
                response.sendStatus(401);
            }
        });
        this._router.use('/cluster', function (request, response, next) {
            if ((0, RequestValidator_1.validateRequest)(request, ['Tutor'])) {
                next();
            }
            else {
                response.sendStatus(401);
            }
        });
        this._router.get('/datafile', this._controller.getBoardClusters);
        this._router.put('/file/upload', this._controller.uploadFile);
        this._router.get('/file/download', this._controller.downloadFile);
        this._router.delete('/file/delete', this._controller.deleteFile);
        this._router.post('/cluster/create', this._controller.createCluster);
        this._router.put('/cluster/modify', this._controller.modifyCluster);
        this._router.delete('/cluster/delete', this._controller.deleteCluster);
    }
}
module.exports = new DatafileBoardRouter().router;
//# sourceMappingURL=DatafileBoardRouter.js.map