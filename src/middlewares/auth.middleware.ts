import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { JwtService } from '@services/jwt.service';
import { Container } from 'typedi';

export const AuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.Authorization;

    if (!token) {
      throw Error;
    }

    const jwtService = Container.get(JwtService);
    const decoded: DataStoredInToken = jwtService.verifyAccessToken(token);

    next();
  } catch (error) {
    next(new HttpException(404, 'Not found'));
  }
};
