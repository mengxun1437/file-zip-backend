import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Share {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  shareId: string;
  @Column({ nullable: false })
  creatorId: string;
  // 存储文件信息,大小,文件名等,后端对信息json序列化存进数据库
  @Column({ default: '{}' })
  fileInfo: string;
  @Column({ nullable: true })
  password: string;
  @Column({ default: -1 })
  downloadTimes: number;
  @Column('bigint', { nullable: true })
  expired: number;
  @Column({ nullable: true })
  url: string;
  @Column('bigint')
  created: number;
  @Column('bigint')
  updated: number;
}
