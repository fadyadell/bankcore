/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('status', 'ok');
        expect(res.body.data).toHaveProperty('uptime');
        expect(res.body.data).toHaveProperty('timestamp');
        expect(res.body.error).toBeNull();
      });
  });

  it('/api/v1/health/db (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/api/v1/health/db')
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('status', 'ok');
        expect(res.body.data).toHaveProperty('database', 'connected');
        expect(typeof res.body.data.userCount).toBe('number');
      });
  });

  it('/api/v1/nonexistent (GET) returns error envelope', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/api/v1/nonexistent')
      .expect(404)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('data', null);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toHaveProperty('message');
        expect(res.body.error).toHaveProperty('code', 'Not Found');
      });
  });
});
