import { hash, compare } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';

@Service()
export class AuthService {
  public async signup(userData: User): Promise<User> {
    const findUser: User = UserModel.find(user => user.email === userData.email);
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = { ...userData, id: UserModel.length + 1, password: hashedPassword };

    return createUserData;
  }

  // TODO: To fix, This API should return JWT Auth token
  public async login(userData: User): Promise<User> {
    const findUser: User = UserModel.find(user => user.email === userData.email);
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    return findUser;
  }

  public async logout(userData: User): Promise<User> {
    const findUser: User = UserModel.find(user => user.email === userData.email && user.password === userData.password);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }
}
