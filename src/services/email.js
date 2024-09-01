import { api, apiAuth } from 'src/boot/axios.js';

export async function sendRegisterVerificationCode(email, isSchool, lang) {
  const res = await api.post('/email/registerVerificationCode/send', { email });
  return res;
}
export async function verifyCode(email, verificationCode) {
  const res = await api.post('/email/registerVerificationCode/verify', { email, verificationCode })
  return res
}
