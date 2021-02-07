import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { AppController } from './app.controller';

@Module({
  imports: [ SharedModule ],
  controllers: [ AppController ],
  providers: [ ],
})
export class AppModule { }
