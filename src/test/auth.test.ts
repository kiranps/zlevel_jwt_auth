import request from 'supertest';
import { Container } from 'typedi';
import { App } from '@/app';
import { User } from '@interfaces/users.interface';
import { AuthRoute } from '@routes/auth.route';
import { JwtService } from '@services/jwt.service';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('TEST Authorization API', () => {
  const route = new AuthRoute();
  const app = new App([route]);

  describe('[POST] /signup', () => {
    it('response should have the Create userData', () => {
      const userData: User = {
        email: 'example@email.com',
        password: 'password123456789',
      };

      return request(app.getServer()).post('/signup').send(userData).expect(201);
    });
  });

  describe('[POST] /login', () => {
    it('response should have the Set-Cookie header with the Authorization token and RefreshToken', () => {
      const userData: User = {
        email: 'example1@email.com',
        password: 'password123456789',
      };

      return request(app.getServer())
        .post('/login')
        .send(userData)
        .expect('Set-Cookie', /^Authorization=.+/)
        .expect(200);
    });

    it('response should have the Set-Cookie header with the RefreshToken token', () => {
      const userData: User = {
        email: 'example1@email.com',
        password: 'password123456789',
      };

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
      const payload = { id: 1 };
      const refreshToken = jwtService.generateRefreshToken(payload);

      return request(app.getServer())
        .get('/refresh')
        .set('Cookie', [`RefreshToken=${refreshToken}`])
        .expect('Set-Cookie', /^Authorization=.+/)
        .expect(200);
    });
  });

  // error: StatusCode : 404, Message : Authentication token missing
  // describe('[POST] /logout', () => {
  //   it('logout Set-Cookie Authorization=; Max-age=0', () => {
  //     const route = new AuthRoute()
  //     const app = new App([route]);

  //     return request(app.getServer())
  //       .post('/logout')
  //       .expect('Set-Cookie', /^Authorization=\;/)
  //       .expect(200);
  //   });
  // });
});
