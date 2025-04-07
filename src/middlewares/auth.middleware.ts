import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/httpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

// TODO: Implement Checking of Auth code here
export const AuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};
