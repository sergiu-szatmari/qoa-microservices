import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { config } from '../config';
import { Server, Socket } from 'socket.io';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from '../redis/redis.service';
import { WsAuthGuard } from '../shared/guards/ws-auth.guard';
import { CityData } from '../shared/models/city';

interface RedisEvent {
  id: string;
  // newData: CityData;
  newData: CityData;
}

@WebSocketGateway(config.ws.port)
export class DataGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  dataSubscriptions: { [key: string]: Set<Socket> } = { };

  constructor(@Inject('DATA_SERVICE') private dataClient: ClientProxy, private redisService: RedisService ) {
    this.redisService
      .fromEvent<RedisEvent>('data')
      .subscribe(({ id, newData }) => {
        console.log(`id: `, id);
        if (this.dataSubscriptions[ id ]) console.table(this.dataSubscriptions[ id ]);

        this.dataSubscriptions[ id ]?.forEach(client => {
          client.emit('message', { id, data: newData });
        })
      });
  }

  private logSubscriptions() {
    console.table(
      Object.keys(this.dataSubscriptions).map((key) => ({
        data: key,
        client: Array.from(this.dataSubscriptions[ key ]).map((socket: Socket) => socket.client.id)
      }))
    );
  }

  async handleConnection(client: Socket) {
    console.log({ client: client.id, event: 'Client connected' });
  }

  async handleDisconnect(client: Socket) {
    Object.keys(this.dataSubscriptions)?.forEach(key => {
      if (this.dataSubscriptions[ key ]?.delete(client)) {
        // Unsubscribe from data microservice
      }
    })
    this.logSubscriptions();
    console.log({ client: client.id, event: 'Client disconnected' });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { country: string, state: string, city: string }) {
    const id = `${ payload.country }-${ payload.state }-${ payload.city }`;

    if (!this.dataSubscriptions[ id ]) {
      this.dataSubscriptions[ id ] = new Set();
    }

    this.dataSubscriptions[ id ].add(client);

    // Subscribe to data microservice
    this.dataClient.emit('subscribe-data', id);

    this.logSubscriptions();
    console.log({ client: client.id, event: 'subscribe', id });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { country: string, state: string, city: string }) {
    const id = `${ payload.country }-${ payload.state }-${ payload.city }`;

    this.dataSubscriptions[ id ]?.delete(client);

    // Unsubscribe from data microservice
    this.dataClient.emit('unsubscribe-data', id);

    this.logSubscriptions();
    console.log({ client: client.id, event: 'unsubscribe', id });
  }
}
