import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { AuthService } from '@services/auth.service';
import { isProduction } from '@config';

export class AuthController {
  public auth = Container.get(AuthService);

  public hello = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ data: 'hello', message: 'hello' });
    } catch (error) {
      next(error);
    }
  };

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.body;
      const signUpUserData: User = await this.auth.signup(userData);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.body;
      const { user, accessToken, refreshToken } = await this.auth.login(userData);

      res.cookie('Authorization', accessToken, {
        httpOnly: true,
        secure: isProduction, // only over https
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      res.cookie('RefreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction, // Only over HTTPS
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
      });
      res.status(200).json({ data: { user }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.RefreshToken;

      if (!refreshToken) throw new HttpException(400, 'Refresh token is required');

      const newAccessToken = await this.auth.refreshToken(refreshToken);

      res.cookie('Authorization', newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(200).json({ message: 'Authorization token refreshed' });
    } catch (error) {
      next(error);
    }
  };

  // TODO: This API is broken and needs to be fixed
  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.auth.logout(userData);

      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
}
