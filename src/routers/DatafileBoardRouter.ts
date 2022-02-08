import { NextFunction, Request, Response, Router } from 'express';
import express from 'express';
import BodyParser from 'body-parser';
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
    this._router.use(BodyParser.urlencoded({ extended: true, limit: '50mb'}));
    this._router.use(BodyParser.json({ limit: '50mb' }));
    this._router.use('/file', express.static('C:\\WMGTSS_FileStorage'));

    this._router.get('/datafile', this._controller.getBoardClusters);
    this._router.put('/file/upload', this._controller.uploadFile);
    this._router.get('/file/download', this._controller.downloadFile);
    this._router.delete('/file/delete', this._controller.deleteFile);
    this._router.delete('/cluster/delete', this._controller.deleteFile);
  }
}

export = new DatafileBoardRouter().router;