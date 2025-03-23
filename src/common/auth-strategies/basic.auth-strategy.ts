import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(
  BasicStrategy,
  'basic',
) {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
  ) {
    super({ realm: 'Users' });
    this.logger = new Logger(BasicAuthStrategy.name);
  }

  async validate(username: string, password: string): Promise<any> {
    const storedUsername = this.configService.get('auth.basic.username');
    const storedPassword = this.configService.get('auth.basic.password');
    if (username === storedUsername && password === storedPassword) {
      return { username };
    }
    this.logger.warn('Authentication failed. Invalid credentials');
    return null;
  }
}
