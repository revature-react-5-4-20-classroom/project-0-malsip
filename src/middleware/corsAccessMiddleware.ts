import {Request, Response, NextFunction} from 'express';

export function corsAccessMiddleware(req:Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', `${req.headers.origin}`);
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  if(req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
  
}