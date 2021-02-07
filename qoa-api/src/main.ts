import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { green } from 'cli-color';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api');
  app.use(morgan('dev'));

  await app.listen(config.api.port);

  const host = await app.getUrl();
  console.log(`Api microservice is ${ green('running') } at ${ green(host) }.`);
}

bootstrap().then();
