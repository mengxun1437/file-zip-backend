import { Body, Controller, Post } from '@nestjs/common';
import { errorBody, successBody } from '../common/utils';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  // 生成token
  async generateToken({ userId, email, password }) {
    const token = this.tokenService.generateToken({ email, password });
    await this.tokenService.updateToken({ userId, token });
    return {
      userId,
      email,
      token,
    };
  }

  @Post('/')
  async addNewUser(@Body() body) {
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
      const tokenInfo = await this.generateToken({
        userId: addInfo.userId,
        email,
        password,
      });
      return successBody(tokenInfo, '注册用户成功');
    } catch (e) {
      return errorBody(`add user failed ${e.message}`);
    }
  }

  @Post('/login')
  async userLogin(@Body() body) {
    try {
      const { email, password } = body;
      if (!email || !password) return errorBody('必要参数缺失');
      const checkedUser = await this.userService.checkUser({ email, password });
      if (!checkedUser.checked) return errorBody('用户密码错误');

      // 登录成功以后,更新token,返回用户信息
      const tokenInfo = await this.generateToken({
        userId: checkedUser.detail.userId,
        email,
        password,
      });
      return successBody(tokenInfo, '登录成功');
    } catch (e) {
      return errorBody(`user login error ${e.message}`);
    }
  }

}
