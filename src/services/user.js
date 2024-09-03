import { useUserStore } from 'stores/user';
import { api, apiAuth } from 'src/boot/axios.js';
import { languagesListObj2str } from "src/utils/languageListTool.js"



//
export const login = async (loginForm) => {
  try {
    const res = await api.post('/user/login', loginForm);
    return res;
  } catch (error) {
    return error
  }
};
//
export const logout = async () => {
  try {
    const res = await apiAuth.delete('/user/logout');
    return res;
  } catch (error) {
    console.log(error);
    return error
  }
};
//
export const changeInterfaceLang = async (interfaceLanguage) => {
  try {
    const res = await apiAuth.post('/user/changeInterfaceLang', { interfaceLanguage });
    return res;
  } catch (error) {
    console.log(error);
    return error
  }
}

//
export const register = async (form) => {
  try {
    const res = await api.post('/user/register', form);
    return res;
  } catch (error) {
    return error
  }
};
//
export async function sendForgetPWDCode(emailObj, lang) {
  try {
    const res = await api.post('/email/forgetPWDCode/send', { ...emailObj })
    return res
  } catch (error) {
    return error
  }
}
export async function resetPWD(emailObj, lang) {
  const res = await api.post('/user/resetPWD', { ...emailObj, lang })
  return res
}
export async function changePWD(form) {
  try {
    const res = await apiAuth.post('/user/changePWD', form)
    // console.log("user:" + JSON.stringify(res));
    return res
  } catch (error) {
    console.log("user-err:" + JSON.stringify(error));
    return error
  }
}

export async function getMyInfo() {
  try {
    const res = await apiAuth.get('/user/getMyInfo')
    return res
  } catch (error) {
    return error
  }
}

export async function updateInfo(form) {
  try {
    const res = await apiAuth.post('/user/updateInfo', form)
    return res
  } catch (error) {
    return error
  }
}
