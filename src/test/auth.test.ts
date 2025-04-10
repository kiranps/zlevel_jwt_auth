import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Container } from 'typedi';
import { App } from '@/app';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';
import { AuthRoute } from '@routes/auth.route';
import { JwtService } from '@services/jwt.service';
import { createUser } from './factories/store_creators';

let mongod: MongoMemoryServer;
let userData: User;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  userData = await createUser('example@email.com', 'password12345');
});

afterAll(async () => {
  await UserModel.deleteMany({});
});

describe('TEST Authorization API', () => {
  const route = new AuthRoute();
  const app = new App([route]);

  describe('[POST] /signup', () => {
    it('response should have the Create userData', () => {
      const userData: User = {
        email: 'example1@email.com',
        password: 'password12345',
      };

      return request(app.getServer()).post('/signup').send(userData).expect(201);
    });
  });

  describe('[POST] /login', () => {
    const userData: User = {
      email: 'example@email.com',
      password: 'password12345',
    };

    it('response should have the Set-Cookie header with the Authorization token', async () => {
      return request(app.getServer())
        .post('/login')
        .send(userData)
        .expect('Set-Cookie', /^Authorization=.+/)
        .expect(200);
    });

    it('response should have the Set-Cookie header with the RefreshToken token', () => {
      return request(app.getServer())
        .post('/login')
        .send(userData)
        .expect('Set-Cookie', /RefreshToken=.+/)
        .expect(200);
    });
  });

  describe('[GET] /refresh', () => {
    it('response should have the Set-Cookie header with the Authorization token', () => {
      const jwtService = Container.get(JwtService);
      const payload = { id: userData.id };
      const refreshToken = jwtService.generateRefreshToken(payload);

      return request(app.getServer())
        .get('/refresh')
        .set('Cookie', [`RefreshToken=${refreshToken}`])
        .expect('Set-Cookie', /^Authorization=.+/)
        .expect(200);
    });
  });

   describe('[POST] /logout', () => {
     it('logout Set-Cookie Authorization=;', () => {
       const route = new AuthRoute()
       const app = new App([route]);

       const jwtService = Container.get(JwtService);
       const payload = { id: userData.id };
       const accessToken = jwtService.generateAccessToken(payload);

       return request(app.getServer())
         .post('/logout')
         .set('Cookie', `Authorization=${accessToken}`)
         .expect('Set-Cookie', /Authorization=;/)
         .expect(200);
     });
   });
});
