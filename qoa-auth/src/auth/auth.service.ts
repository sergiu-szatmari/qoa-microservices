import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwks from 'jwks-rsa';
import { config } from '../config';

@Injectable()
export class AuthService {
  jwksClient: jwks.JwksClient;

  constructor() {
    this.jwksClient = jwks({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: config.auth0Uri
    });
  }

  private verifyToken(token: string, key: string) {
    return new Promise<boolean>((onResolve) => {
      jwt.verify(token, key, (err) => {
        onResolve(!!!err);
      })
    });
  }

  public async verifyAuthToken(token: string) {
    const decodedToken = jwt.decode(token, { complete: true }) as { [key: string]: any };

    const { kid } = decodedToken?.header;
    if (!kid) return false;

    const key = await this.jwksClient.getSigningKeyAsync(kid);
    const signingKey = key.getPublicKey();
    return this.verifyToken(token, signingKey);
  }

  public async verifyAuthHeader(authHeader: string): Promise<boolean> {
    if (!authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.slice('Bearer '.length);
    return this.verifyAuthToken(token);
  }
}
