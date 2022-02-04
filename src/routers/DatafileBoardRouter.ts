import { NextFunction, Request, Response, Router } from 'express';
import cors from 'cors';
import DatafileBoardController from '../controllers/DatafileBoardController';

const options: cors.CorsOptions = {
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
  private _router = Router();
  private _controller = DatafileBoardController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching controller endpoints.
   */
  private _configure() {
    this._router.use(cors(options));

    this._router.get('/datafile', this._controller.getBoardClusters);
  }
}

export = new DatafileBoardRouter().router;