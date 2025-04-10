import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { App } from '@/app';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';
import { UserRoute } from '@routes/users.route';
import { JwtService } from '@services/jwt.service';
import { Container } from 'typedi';
import { createUser } from './factories/store_creators';

let mongod: MongoMemoryServer;
let userData: User;
let accessToken: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  userData = await createUser('example@email.com', 'password12345');

  const jwtService = Container.get(JwtService);
  const payload = { id: userData.id };
  accessToken = jwtService.generateAccessToken(payload);
});

afterAll(async () => {
  await UserModel.deleteMany({});
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe('TEST Users API', () => {
  const route = new UserRoute();
  const app = new App([route]);

  describe('[GET] /users', () => {
    it('response statusCode 200 /findAll', async () => {
      const user0 = userData;
      const user1 = await createUser('example1@email.com', 'password123456789');
      const user2 = await createUser('example2@email.com', 'password123456789');
      const user3 = await createUser('example3@email.com', 'password123456789');

      const users = [user0, user1, user2, user3];

      return request(app.getServer())
        .get(`${route.path}`)
        .set('Cookie', `Authorization=${accessToken}`)
        .expect(200, { data: users, message: 'findAll' });
    });
  });

  describe('[GET] /users without Authorization token', () => {
    it('response statusCode 404 Not found', () => {
      return request(app.getServer()).get(`${route.path}`).expect(404, { message: 'Not found' });
    });
  });

  describe('[GET] /users/:id', () => {
    it('response statusCode 200 /findOne', () => {
      return request(app.getServer())
        .get(`${route.path}/${userData.id}`)
        .set('Cookie', `Authorization=${accessToken}`)
        .expect(200, { data: userData, message: 'findOne' });
    });
  });

  describe('[POST] /users', () => {
    it('response statusCode 201 /created', async () => {
      const userData: User = {
        email: 'example4@email.com',
        password: 'password123456789',
      };

      return request(app.getServer()).post(`${route.path}`).set('Cookie', `Authorization=${accessToken}`).send(userData).expect(201);
    });
  });

  describe('[PUT] /users/:id', () => {
    it('response statusCode 200 /updated', async () => {
      const password = 'password123456789';

      return request(app.getServer())
        .put(`${route.path}/${userData.id}`)
        .set('Cookie', `Authorization=${accessToken}`)
        .send({ password })
        .expect(200);
    });
  });

  describe('[DELETE] /users/:id', () => {
    it('response statusCode 200 /deleted', async () => {
      const user4 = await createUser('example5@email.com', 'password123456789');

      return request(app.getServer())
        .delete(`${route.path}/${user4.id}`)
        .set('Cookie', `Authorization=${accessToken}`)
        .expect(200, { data: user4, message: 'deleted' });
    });
  });
});
