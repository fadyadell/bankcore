import { Controller, All, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProxyService } from './proxy.service.js';

@Controller('loans')
export class LoanProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyLoans(@Req() req: Request) {
    const path = req.path.replace('/api/v1/loans', '/loans');
    return this.proxyService.forward('loan', {
      method: req.method,
      path: path,
      body: req.body,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
    });
  }
}
