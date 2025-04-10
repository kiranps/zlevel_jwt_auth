import { Service } from 'typedi';
import { User } from '@interfaces/users.interface';
import { UserRepo } from '@repos/users.repo'

@Service()
export class UserService {
  constructor(private userRepo: UserRepo) {}

  public async findAllUser(): Promise<User[]> {
    return await this.userRepo.findAllUser();
  }

  public async findUserById(userId: string): Promise<User> {
    return await this.userRepo.findUserById(userId);
  }

  public async findUserByEmail(email: string): Promise<User> {
    return await this.userRepo.findUserByEmail(email);
  }

  public async createUser(userData: User): Promise<User> {
    return await this.userRepo.createUser(userData);
  }

  public async updateUser(userId: string, userData: User): Promise<User> {
    return await this.userRepo.updateUser(userId, userData);
  }

  public async deleteUser(userId: string): Promise<User> {
    return await this.userRepo.deleteUser(userId);
  }
}
