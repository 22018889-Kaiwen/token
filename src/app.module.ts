import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokenModel, TokensRepository } from './services/token.model';
import { TokenService } from './services/token.service';
import { TokenController } from './controllers/token.controller.https';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseModule } from 'src/database/database.module';

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
