import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY } from '@config';

@Service()
export class JwtService {
  private readonly accessTokenSecret = JWT_ACCESS_SECRET;
  private readonly refreshTokenSecret = JWT_REFRESH_SECRET;
  private readonly accessTokenExpiresIn = JWT_ACCESS_TOKEN_EXPIRY;
  private readonly refreshTokenExpiresIn = JWT_REFRESH_TOKEN_EXPIRY;

  generateAccessToken(payload: DataStoredInToken): string {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: this.accessTokenExpiresIn });
  }

  generateRefreshToken(payload: DataStoredInToken): string {
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiresIn });
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, this.accessTokenSecret);
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.refreshTokenSecret);
  }
}
