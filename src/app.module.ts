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

@Module({
  imports: [
    TypeOrmModule.forRoot(MYSQL_CONNECT_CONFIG),
    UserModule,
    EmailModule,
  ],
  controllers: [AppController, UserController, EmailController],
  providers: [AppService, UserService, EmailService],
})
export class AppModule {}
