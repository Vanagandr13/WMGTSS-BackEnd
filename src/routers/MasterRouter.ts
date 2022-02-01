import { Router } from 'express';
import DatafileBoardRouter from './DatafileBoardRouter';

class MasterRouter {
  private _router = Router();
  private _datafileBoardSubrouter = DatafileBoardRouter;


  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.use('/datafile', this._datafileBoardSubrouter);
  }
}

export = new MasterRouter().router;