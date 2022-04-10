import { createHash } from "crypto";

export const successBody = (data = {}, message = 'success') => ({
  code: 0,
  message,
  data,
});

export const errorBody = (message = 'error', data = {}) => ({
  code: 40000,
  message,
  data,
});


export const hashMd5 = (str) => {
  const md5 = createHash("md5");
  return md5.update(str).digest("hex")
}
