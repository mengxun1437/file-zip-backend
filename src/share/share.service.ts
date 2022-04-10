import { Injectable } from '@nestjs/common';
import { Share } from './share.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export enum GetShareState {
  NOT_EXIST = 1,
  OUT_EXPIRED = 2,
  CAN_NOT_DOWNLOAD = 3,
  HAS_PASSWORD = 4,
}

export interface GetShare {
  state: GetShareState;
  exist: boolean;
  info: any;
  detail: Share;
}

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(Share)
    private readonly shareRepository: Repository<Share>,
  ) {}

  // 获取一个文件分享信息
  /**
   * 请求一个文件
   * 有过期时间且过期: 返回文件过期
   * 有下载次数,且剩余下载次数不够,返回下载次数错误
   * 有密码且密码错误,返回密码错误信息
   * 返回下载链接
   */
  async getShare(shareId): Promise<GetShare> {
    const _default: GetShare = {
      state: GetShareState.NOT_EXIST,
      exist: false,
      info: {},
      detail: null,
    };
    const dbShare = await this.shareRepository.findOne({
      shareId,
    });
    if (dbShare && shareId) {
      // 将基本信息放在info字段中
      _default.exist = true;
      _default.detail = dbShare;
      // 处理后返回
      const newInfo = { ...dbShare };
      delete newInfo.password;
      newInfo.fileInfo = JSON.parse(newInfo.fileInfo);
      _default.info = newInfo;

      if (dbShare.expired && new Date().getTime() > dbShare.expired) {
        _default.state = GetShareState.OUT_EXPIRED;
      } else {
        if (dbShare.downloadTimes !== -1 && dbShare.downloadTimes === 0) {
          _default.state = GetShareState.CAN_NOT_DOWNLOAD;
        } else {
          if (dbShare.password) {
            _default.state = GetShareState.HAS_PASSWORD;
          }
        }
      }
    }

    return _default;
  }

  async updateShareFile(options: any = {}) {
    const _share = await this.getShare(options.shareId);
    const { creatorId, fileInfo, password, downloadTimes, expired, url } =
      options;
    let saveShare = new Share();
    const currentDate = new Date().getTime();
    if (!_share.exist) {
      saveShare.shareId = options.shareId;
      saveShare.created = currentDate;
      saveShare.creatorId = creatorId;
    } else {
      saveShare = _share.detail;
    }
    saveShare.updated = currentDate;
    if (fileInfo) {
      saveShare.fileInfo = JSON.stringify(fileInfo);
    }
    if (password) {
      saveShare.password = password;
    }
    if (downloadTimes) {
      saveShare.downloadTimes = downloadTimes;
    }
    if (expired) {
      saveShare.expired = expired;
    }
    if (url) {
      saveShare.url = url;
    }

    await this.shareRepository.save(saveShare);
  }
}
