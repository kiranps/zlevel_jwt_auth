import { hash, compare } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { JwtService } from '@services/jwt.service';
import { AuthResponse, DataStoredInToken } from '@interfaces/auth.interface';
import { UserModel } from '@models/users.model';

@Service()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  public async signup(userData: User): Promise<User> {
    const findUser: User = UserModel.find(user => user.email === userData.email);
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = { ...userData, id: UserModel.length + 1, password: hashedPassword };

    return createUserData;
  }

  public async login(userData: User): Promise<AuthResponse> {
    const findUser: User = UserModel.find(user => user.email === userData.email);
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const payload: DataStoredInToken = {id: findUser.id}

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return { user: findUser, accessToken, refreshToken };
  }

  public async logout(userData: User): Promise<User> {
    const findUser: User = UserModel.find(user => user.email === userData.email && user.password === userData.password);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }
}
