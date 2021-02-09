import { HttpModule, Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
  controllers: [ DataController ],
  imports: [ HttpModule ],
  providers: [ DataService ]
})
export class DataModule {}
