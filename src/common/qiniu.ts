const qiniu = require('qiniu');
import { QINIU_AK, QINIU_SK, QINIU_BUCKET } from './constants';
import * as fs from 'fs';

export const uploadStreamToQiniu = (key: string, filePath: any) =>
  new Promise((res) => {
    const mac = new qiniu.auth.digest.Mac(QINIU_AK, QINIU_SK);
    const options = {
      scope: QINIU_BUCKET,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    const config: any = new qiniu.conf.Config();

    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    formUploader.putFile(
      uploadToken,
      key,
      filePath,
      putExtra,
      (err, data, resp) => {
        console.log(err, data, resp);
        const dir = filePath.split('/')[0];
        if (fs.existsSync(dir)) {
          fs.rmdirSync(dir, { recursive: true });
        }
        if (resp?.status === 200) {
          res(true);
        } else {
          res(false);
        }
      },
    );
  });
