import { Body, Controller, Post } from '@nestjs/common';
import { errorBody, successBody } from '../common/utils';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}
  @Post('/')
  async AddNewUser(@Body() body) {
    try {
      const { email, checkCode, password, nickName } = body;
      if (!email || !checkCode || !password) {
        return errorBody('必须要参数缺失,请检查 email,checkCode,password');
      }
      const user = await this.userService.getUser(email);
      if (user.exist) return errorBody('此邮箱已经注册~');
      const _email = await this.emailService.getEmail(email);
      if (!_email.exist) return errorBody('未获取邮箱验证码~');
      if (_email.detail.checkCode !== checkCode)
        return errorBody('验证码错误~');
      if (!_email.expired) return errorBody('邮箱验证码已过期,请重新申请~');

      const addInfo = await this.userService.updateUser({
        email,
        password,
        nickName,
      });
      return successBody(addInfo, '注册用户成功');
    } catch (e) {
      return errorBody(`add user failed ${e.message}`);
    }
  }
}
