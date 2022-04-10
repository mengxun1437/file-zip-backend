import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from './email.entity';
import { SendEmail } from '../common/email';

interface GetEmail {
  exist: boolean;
  expired: boolean;
  detail: Email | undefined;
}

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
  ) {}

  // 检查一个邮箱是由存在, 验证码是否过期，邮箱具体信息
  async getEmail(email): Promise<GetEmail> {
    const _default = {
      exist: false,
      expired: false,
      detail: null,
    };
    const dbEmail = await this.emailRepository.findOne({
      email,
    });
    if (!dbEmail || !email) return _default;

    _default.exist = true;
    // 获取时间,计算是否在五分钟以内
    _default.expired =
      new Date().getTime() - dbEmail.updated <=
      5 * 60 * 1000;
    _default.detail = dbEmail;

    return _default;
  }

  // 更新一条email信息
  async updateEmail({ email, checkCode }) {
    const dbEmail = await this.getEmail(email);
    let saveEmail = new Email();
    const currentDate = new Date().getTime();
    if (!dbEmail.exist) {
      saveEmail.email = email;
      saveEmail.created = currentDate;
    } else {
      saveEmail = dbEmail.detail;
    }
    saveEmail.checkCode = checkCode;
    saveEmail.updated = currentDate;

    await this.emailRepository.save(saveEmail);
  }

  // 发送验证码
  async sendEmail({ email, checkCode }) {
    const _email = new SendEmail();
    await _email.sendEmail({
      to: email,
      subject: '注册用户验证码',
      html: `您的FileZip用户注册验证码是 <b>${checkCode}</b> ,五分钟内有效`,
    });
  }
}
