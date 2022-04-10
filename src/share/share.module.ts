import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Share } from './share.entity';

@Module({
    imports:[TypeOrmModule.forFeature([Share])],
    providers: [],
    controllers: [],
    exports: [TypeOrmModule],
})
export class ShareModule {}
