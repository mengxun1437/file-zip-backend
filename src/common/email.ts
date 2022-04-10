import { EMAIL_CONFIG } from './constants';
const nodemailer = require('nodemailer');

export interface SendEmailOptions {
  from?: string;
  to: string;
  subject?: string;
  html: string;
}

export interface EmailOptions {
  service?: string;
  port?: number;
  user?: string;
  pass?: string;
}

export class SendEmail {
  transporter: any;
  constructor(options: EmailOptions = {}) {
    this.transporter = nodemailer.createTransport({
      service: options.service || EMAIL_CONFIG.service,
      port: options.port || EMAIL_CONFIG.port,
      secureConnection: true,
      auth: {
        user: options.user || EMAIL_CONFIG.user,
        pass: options.pass || EMAIL_CONFIG.pass,
      },
    });
  }

  async sendEmail(sendEmailOptions: SendEmailOptions) {
    await this.transporter.sendMail({
      from: sendEmailOptions.from || '6328322<wujun.wang@foxmail.com>',
      to: sendEmailOptions.to,
      subject: sendEmailOptions.subject || 'FileZip 注册邮箱',
      html: sendEmailOptions.html,
    });
  }
}
