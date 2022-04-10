// 为了快速开发，先用mysql完成email验证码的部分

import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  email: string;
  @Column()
  checkCode: number;
  @Column('bigint')
  created: number;
  @Column('bigint')
  updated: number;
}
