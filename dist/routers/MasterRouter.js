"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const DatafileBoardRouter_1 = __importDefault(require("./DatafileBoardRouter"));
class MasterRouter {
    constructor() {
        this._router = (0, express_1.Router)();
        this._datafileBoardSubrouter = DatafileBoardRouter_1.default;
        this._configure();
    }
    get router() {
        return this._router;
    }
    /**
     * Connect routes to their matching routers.
     */
    _configure() {
        this._router.use('/datafile', this._datafileBoardSubrouter);
    }
}
module.exports = new MasterRouter().router;
//# sourceMappingURL=MasterRouter.js.map