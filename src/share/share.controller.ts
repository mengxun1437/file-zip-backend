import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { ShareService } from './share.service';
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
  @Get('/')
  async getShareFileInfo(@Query('shareId') shareId) {
    if (!shareId) return errorBody('shareId参数缺失');
    try {
      const shareInfo = await this.shareService.getShare(shareId);
      return successBody({
        state: shareInfo.state,
        info: shareInfo.info,
      });
    } catch (e) {
      return errorBody(`get share fileInfo error ${e.message}`);
    }
  }

  @Post('/')
  async addNewShareFile(@Body() body, @Headers() headers) {
    const checkedHd = await this.tokenService.checkTokenValid(headers);
    if (!checkedHd.checked) {
      return {
        code: 40300,
        message: 'token校验失败',
        data: checkedHd,
      };
    }
    const { fileData, fileName } = body;
    if (!fileData || !fileName) {
      return errorBody('必要参数缺失,请检查 fileData,fileName');
    }
    const creatorId = headers.userid;

    try {
      const shareId = body.shareId || randomUUID().replace(/-/g, '');
      const directory = hashMd5(`${creatorId}${new Date().getTime()}`);
      const path = `${directory}/${fileName}`;
      try {
        const upload = await uploadStreamToQiniu(path, fileData);
        if (upload) {
          const url = `${QINIU_BUCKET_URL}/${path}`;
          await this.shareService.updateShareFile({
            ...body,
            shareId,
            creatorId,
            url,
          });
          return successBody({ shareId, creatorId });
        } else {
          return errorBody('文件上传失败');
        }
      } catch {
        return errorBody('文件上传失败');
      }
    } catch (e) {
      return errorBody(`add new share file error ${e.message}`);
    }
  }
}
