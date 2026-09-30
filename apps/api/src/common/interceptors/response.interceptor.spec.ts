import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  it('should wrap the response in a standard envelope', (done) => {
    const interceptor = new ResponseInterceptor();
    const mockContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({ mydata: 123 }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({
          data: { mydata: 123 },
          error: null,
        });
        done();
      },
    });
  });

  it('should handle undefined data by setting data to null', (done) => {
    const interceptor = new ResponseInterceptor();
    const mockContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: () => of(undefined),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({
          data: null,
          error: null,
        });
        done();
      },
    });
  });
});
