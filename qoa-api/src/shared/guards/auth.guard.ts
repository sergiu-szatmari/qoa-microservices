import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authHeader = (context.switchToHttp().getRequest() as Request).headers.authorization || '';
    return this.authClient
      .send({ cmd: 'verify-auth-header' }, authHeader)
      .toPromise();
  }
}
