import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from './email.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Email])],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class EmailModule {}
