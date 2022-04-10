import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MYSQL_CONNECT_CONFIG } from './common/constrants';
import { EmailController } from './email/email.controller';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';
import { TokenService } from './token/token.service';
import { TokenModule } from './token/token.module';
import { TokenController } from './token/token.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(MYSQL_CONNECT_CONFIG),
    UserModule,
    EmailModule,
    TokenModule,
  ],
  controllers: [AppController, UserController, EmailController,TokenController],
  providers: [AppService, UserService, EmailService, TokenService],
})
export class AppModule {}
