import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { ShareService } from './share.service';
import { errorBody, successBody } from '../common/utils';
import { TokenService } from '../token/token.service';
import { randomUUID } from 'crypto';

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
      // TODO: upload fileData and fileName to QINIU CDN
      await this.shareService.updateShareFile({ ...body, shareId, creatorId });
      return successBody({ shareId, creatorId });
    } catch (e) {
      return errorBody(`add new share file error ${e.message}`);
    }
  }
}
