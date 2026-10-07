/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('User Journey (e2e)', () => {
  let app: INestApplication;
  let customerToken: string;
  let employeeToken: string;
  let adminToken: string;
  let accountId: string;
  let anotherAccountId: string;
  let loanId: string;

  beforeAll(async () => {
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

  it('1. Login all users', async () => {
    // Customer
    let res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'customer@bankcore.local', password: 'customer123' })
      .expect(201);
    customerToken = res.body.data.accessToken;
    expect(customerToken).toBeDefined();

    // Employee
    res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'employee@bankcore.local', password: 'employee123' })
      .expect(201);
    employeeToken = res.body.data.accessToken;
    expect(employeeToken).toBeDefined();

    // Admin
    res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bankcore.local', password: 'admin123' })
      .expect(201);
    adminToken = res.body.data.accessToken;
    expect(adminToken).toBeDefined();
  });

  it('2. Security: Unauthenticated request fails', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/dashboard/customer')
      .expect(401);
  });

  it('3. Security: Customer cannot access employee endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/loans')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it('4. Security: Employee cannot access admin endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(403);
  });

  it('5. View customer dashboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/customer')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(res.body.data.accounts).toBeDefined();
    accountId = res.body.data.accounts[0].id;
    anotherAccountId = res.body.data.accounts[1].id;
  });

  it('6. Deposit', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/transactions/deposit')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ accountId, amount: 100 })
      .expect(201);
  });

  it('7. Withdraw', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/transactions/withdraw')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ accountId, amount: 50 })
      .expect(201);
  });

  it('8. Security: Withdraw greater than balance', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/transactions/withdraw')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ accountId, amount: 999999999 })
      .expect(400);
  });

  it('9. Transfer', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/transactions/transfer')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fromAccountId: accountId,
        toAccountId: anotherAccountId,
        amount: 20,
      })
      .expect(201);
  });

  it('10. Security: Transfer greater than balance', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/transactions/transfer')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fromAccountId: accountId,
        toAccountId: anotherAccountId,
        amount: 9999999,
      })
      .expect(400);
  });

  it('11. Security: Transfer with invalid amount', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/transactions/transfer')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fromAccountId: accountId,
        toAccountId: anotherAccountId,
        amount: -10,
      })
      .expect(400);
  });

  it('12. View transactions', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/transactions/my')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('13. Request loan', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ amount: 1000, termMonths: 12 })
      .expect(201);
    loanId = res.body.data.id;
    
    // Verify GoRules and Flowable executed successfully
    expect(res.body.data.status).toBe('EMPLOYEE_REVIEW');
    expect(res.body.data.processId).toBeDefined();
    expect(res.body.data.riskScore).toBe(20);
  });

  it('14. Employee reviews loan', async () => {
    await request(app.getHttpServer())
      .put(`/api/v1/loans/${loanId}/review`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);
  });

  it('16. Notification appears for customer', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications/my')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const approvedNotif = res.body.data.find(
      (n: any) => n.title === 'Loan Approved!',
    );
    expect(approvedNotif).toBeDefined();
  });
});
