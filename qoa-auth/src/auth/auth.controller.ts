import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { green, red } from 'cli-color';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @MessagePattern({ cmd: 'verify-auth-header' })
  async verifyAuthHeader(authHeader: string): Promise<boolean> {
    const isValid = await this.authService.verifyAuthHeader(authHeader);
    console.log(`Header is ${ isValid ? green('valid') : red('not valid') } (${ authHeader.slice('Bearer '.length, 20) }....)`);
    return isValid;
  }

  @MessagePattern({ cmd: 'verify-token' })
  async verifyToken(token: string): Promise<boolean> {
    const isValid = await this.authService.verifyAuthToken(token);
    console.log(`Token is ${ isValid ? green('valid') : red('not valid') } (${ token.slice(0, 20) }...)`);
    return isValid;
  }
}
