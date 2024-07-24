import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokenModel, TokensRepository } from './services/ERC20/token.model';

import { TokenController } from './controllers/token.controller.https';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseModule } from 'src/database/database.module';
import { TokenService } from './services/ERC20/token.service';

const models: any[] = [TokenModel];
const modules: any[] = [];

const repositories: any[] = [TokensRepository];
const services: any[] = [TokenService];

const controllers: any[] = [TokenController];
@Module({
  imports: [
    ConfigModule,
    DatabaseModule.register({ models }),
    HttpModule,
    ...modules,
  ],
  providers: [...repositories, ...services],
  controllers: controllers,
})
export class AppModule {}
