const qiniu = require('qiniu');
import { QINIU_AK, QINIU_SK, QINIU_BUCKET } from './constants';

export const uploadStreamToQiniu = (key: string, fileData: any) =>
  new Promise((res) => {
    {
      const mac = new qiniu.auth.digest.Mac(QINIU_AK, QINIU_SK);
      const options = {
        scope: QINIU_BUCKET,
      };
      const putPolicy = new qiniu.rs.PutPolicy(options);
      const uploadToken = putPolicy.uploadToken(mac);

      const config: any = new qiniu.conf.Config();

      const formUploader = new qiniu.form_up.FormUploader(config);
      const putExtra = new qiniu.form_up.PutExtra();
      formUploader.put(
        uploadToken,
        key,
        fileData,
        putExtra,
        (err, data, resp) => {
        //   console.log(resp); 
          if (resp.status === 200) {
            res(true);
          } else {
            res(false);
          }
        },
      );
    }
  });
