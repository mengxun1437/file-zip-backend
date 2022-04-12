import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { GetShareState, ShareService } from './share.service';
import { errorBody, successBody, hashMd5 } from '../common/utils';
import { TokenService } from '../token/token.service';
import { randomUUID } from 'crypto';
import { uploadStreamToQiniu } from '../common/qiniu';
import { QINIU_BUCKET_URL } from 'src/common/constants';

@Controller('share')
export class ShareController {
  constructor(
    private readonly shareService: ShareService,
    private readonly tokenService: TokenService,
  ) {}

  // 获取一个文件的信息
  @Post('/')
  async getShareFileInfo( @Body() body) {
    const { shareId,password } = body;
    if (!shareId) return errorBody('shareId参数缺失');
    try {
      const share = await this.shareService.getShare(shareId);
      const returnBody = {
        state: share.state,
        info: share.info,
      };
      if (share.state === GetShareState.NOT_EXIST)
        return successBody(returnBody, '文件资源不存在');
      if (share.state === GetShareState.OUT_EXPIRED)
        return successBody(returnBody, '文件资源已经过期');
      if (share.state === GetShareState.CAN_NOT_DOWNLOAD)
        return successBody(returnBody, '超出文件可下载次数');
      if (share.state === GetShareState.HAS_PASSWORD) {
        // 如果文件有密码,但是body中没有传密码的时候,无法获取url
        if (!password) {
          return successBody(returnBody, '该文件需要密码');
        }
        if (password !== share.detail.password) {
          return successBody(returnBody, '密码错误');
        } else {
          returnBody.state = GetShareState.SUCCESS
          returnBody.info.url = share.detail.url;
        }
      }

      // 如果校验通过,获取数据,返回对象为
      if (share.state === GetShareState.SUCCESS) {
        returnBody.info.url = share.detail.url;
      }
      return successBody(returnBody, '获取文件url成功');
    } catch (e) {
      return errorBody(`get share fileInfo error ${e.message}`);
    }
  }

  @Post('/')
  async updateShareFile(@Body() body, @Headers() headers) {
    const checkedHd = await this.tokenService.checkTokenValid(headers);
    if (!checkedHd.checked) {
      return {
        code: 40300,
        message: 'token校验失败',
        data: checkedHd,
      };
    }
    const { fileData, fileName, action } = body;
    if (action === 'add' && (!fileData || !fileName)) {
      return errorBody('必要参数缺失,请检查 fileData,fileName');
    }
    const creatorId = headers.userid;

    try {
      const shareId = body.shareId || randomUUID().replace(/-/g, '');
      let url = '';
      if (action === 'add') {
        const directory = hashMd5(`${creatorId}${new Date().getTime()}`);
        const path = `${directory}/${fileName}`;
        try {
          const upload = await uploadStreamToQiniu(path, fileData);
          if (upload) {
            url = `${QINIU_BUCKET_URL}/${path}`;
          } else {
            return errorBody('文件上传失败');
          }
        } catch {
          return errorBody('文件上传失败');
        }
      }
      await this.shareService.updateShareFile({
        ...{
          ...body,
          shareId,
          creatorId,
        },
        ...(action === 'add' ? { url } : {}),
      });
      return successBody({ shareId, creatorId });
    } catch (e) {
      return errorBody(`add new share file error ${e.message}`);
    }
  }
}
