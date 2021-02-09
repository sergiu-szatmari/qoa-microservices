import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [ DataModule, SharedModule ],
  controllers: [ AppController ],
  providers: [ AppService ],
})
export class AppModule {}
