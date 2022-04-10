import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Email } from '../email/email.entity';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { randomUUID } from 'crypto';
import { hashMd5 } from '../common/utils';

interface UserInfo {
  email: string;
  nickName?: string;
  password?: string;
}

export interface GetUser {
  exist: boolean;
  detail: User | undefined;
}

export interface CheckedUser extends GetUser {
  checked: boolean;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 判断邮箱和密码是否匹配
  async checkUser({ email, password }) {
    const user = await this.getUser(email);
    const _user: CheckedUser = { ...user, checked: false };
    if (!user.exist) {
      _user.checked = false;
    } else {
      _user.checked = user.detail.password === hashMd5(password);
    }
    return _user;
  }

  async getUser(email): Promise<GetUser> {
    const _default = {
      exist: false,
      detail: null,
    };
    const dbUser = await this.userRepository.findOne({
      email,
    });
    if (!dbUser || !email) return _default;

    _default.exist = true;
    _default.detail = dbUser;

    return _default;
  }

  async updateUser(userInfo: UserInfo) {
    const _date = new Date().getTime();
    let user = new User();
    const _user = await this.getUser(userInfo.email);
    if (!_user.exist) {
      const userId = randomUUID();
      user.userId = userId;
      user.email = userInfo.email;
      user.nickName = userInfo.nickName || `用户${new Date().getTime()}`;
      user.password = hashMd5(userInfo.password);
      user.created = _date;
    } else {
      user = _user.detail;
    }

    user.updated = _date;

    await this.userRepository.save(user);
    return { userId: user.userId, email: user.email };
  }
}
