import { Body, Controller, Post } from '@nestjs/common';
import { errorBody, successBody } from '../common/utils';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('/')
  // 请求验证码
  async PostEmailCode(@Body() body) {
    if (!body.email) {
      return errorBody('email 参数丢失');
    }
    try {
      // 生成六位数验证码
      const checkCode = Number(Math.random().toString().slice(-6));
      const option = {
        email: body.email,
        checkCode,
      };
      await this.emailService.updateEmail(option);
      await this.emailService.sendEmail(option);
      return successBody();
    } catch (e) {
      return errorBody(`请求验证码错误 ${e.message}`);
    }
  }
}
