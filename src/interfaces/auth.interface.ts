import { Request } from 'express';
import { User } from '@interfaces/users.interface';

// TODO: This data needs to be stored in token
export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}
