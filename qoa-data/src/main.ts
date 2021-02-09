import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from './config';
import { green } from 'cli-color';

async function bootstrap() {
  const { host, port } = config;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { host, port }
    }
  );
  await app.listen(() => { console.log(`Data microservice is ${ green('running') } at ${ green(host + ':' + port) }`); });
}

bootstrap().then();
