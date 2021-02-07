import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from '../config';


@Module({
  imports: [
    ClientsModule.register([{
      name: 'AUTH_SERVICE',
      transport: Transport.TCP,
      options: {
        host: config.auth.host,
        port: config.auth.port
      }
    }])
  ],
  exports: [ ClientsModule ]
})
export class SharedModule {}
