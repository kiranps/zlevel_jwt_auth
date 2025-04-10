import { hash, compare } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { JwtService } from '@services/jwt.service';
import { AuthResponse, DataStoredInToken } from '@interfaces/auth.interface';
import { UserModel } from '@models/users.model';
import { UserRepo } from '@repos/users.repo';

@Service()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepo: UserRepo,
  ) {}

  public async signup(userData: User): Promise<User> {
    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = { ...userData, password: hashedPassword };
    return await this.userRepo.createUser(createUserData);
  }

  public async login(userData: User): Promise<AuthResponse> {
    const findUser: User = await this.userRepo.findUserByEmail(userData.email)

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const payload: DataStoredInToken = { id: findUser.id };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return { user: findUser, accessToken, refreshToken };
  }

  public async refreshToken(refreshToken: string): Promise<string> {
    try {
      const jwtData = this.jwtService.verifyRefreshToken(refreshToken);
      const findUser: User = await this.userRepo.findUserById(jwtData.id)
      const payload: DataStoredInToken = { id: findUser.id };

      const newAccessToken = this.jwtService.generateAccessToken(payload);
      return newAccessToken;
    } catch (err) {
      throw new HttpException(403, 'Refresh token expired or invalid');
    }
  }
}
