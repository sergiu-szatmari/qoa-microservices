import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { SharedModule } from '../shared/shared.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from '../config';

@Module({
  imports: [
    SharedModule,
    ClientsModule.register([{
      name: 'DATA_SERVICE',
      transport: Transport.TCP,
      options: {
        host: config.data.host,
        port: config.data.port
      }
    }]),
  ],
  controllers: [ DataController ]
})
export class DataModule {}
