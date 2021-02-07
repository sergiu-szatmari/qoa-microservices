import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './shared/guards/auth.guard';

@Controller()
@UseGuards(AuthGuard)
export class AppController {

  @Get()
  async someFunc() {
    return 'test';
  }
}
