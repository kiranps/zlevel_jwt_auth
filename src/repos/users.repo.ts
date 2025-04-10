import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { UserModel, UserDocument } from '@models/users.model';

@Service()
export class UserRepo {
  public async findAllUser(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map(this.toUser);
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser = await UserModel.findById(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return this.toUser(findUser);
  }

  public async findUserByEmail(email: string): Promise<User> {
    const findUser = await UserModel.findOne({ email });
    if (!findUser) throw new HttpException(404, "User doesn't exist");

    return this.toUser(findUser);
  }

  public async createUser(userData: User): Promise<User> {
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new HttpException(409, `This email ${userData.email} already exists`);
    }

    const hashedPassword = await hash(userData.password, 10);
    const newUser = new UserModel({
      ...userData,
      password: hashedPassword,
    });

    const createdUser = await newUser.save();
    return this.toUser(createdUser);
  }

  public async updateUser(userId: string, userData: User): Promise<User> {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new HttpException(404, "User doesn't exist");
    }

    if (userData.password) {
      userData.password = await hash(userData.password, 10);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, userData, { new: true });
    return this.toUser(updatedUser);
  }

  public async deleteUser(userId: string): Promise<User> {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new HttpException(404, "User doesn't exist");
    }

    const deletedUser = await UserModel.findByIdAndDelete(userId);
    return this.toUser(deletedUser);
  }

  private toUser(doc: UserDocument): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
    };
  }
}
