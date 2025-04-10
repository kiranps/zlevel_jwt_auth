import { UserRepo } from '@repos/users.repo';
import { User } from '@interfaces/users.interface';
import { Container } from 'typedi';

export async function createUser(email: string, password: string): Promise<User> {
  const newUserData = {
    email: email,
    password: password || 'password123456789',
  };

  const userRepo = Container.get(UserRepo);

  return await userRepo.createUser(newUserData);
}
