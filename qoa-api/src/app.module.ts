import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { AppController } from './app.controller';
import { DataModule } from './data/data.module';

@Module({
  imports: [ SharedModule, DataModule ],
  controllers: [ AppController ],
  providers: [ ],
})
export class AppModule { }
