import { api, apiAuth } from 'src/boot/axios';

export async function sendRegisterVerificationCode(email, isSchool, lang) {
  const res = await api.post('/email/sendRegisterVerificationCode', { email, isSchool, lang });
  return res;
}
export async function verifyCode(email, verificationCode) {
  const res = await api.post('/user/verifyCode', { email, verificationCode })
  return res
}
