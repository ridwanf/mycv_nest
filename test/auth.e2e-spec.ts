import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST) should create a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.email).toEqual('test@test.com');
  });

  it('/auth/signin (POST) should sign in a user', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.email).toEqual('test@test.com');
  });

  it('/auth/signout (POST) should sign out a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signout')
      .expect(200);

    expect(response.body).toEqual({});
  });

  it('/auth/whoami (GET) should return the current user', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201);

    const response = await agent.get('/auth/whoami').expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.email).toEqual('test@test.com');
  });
});
