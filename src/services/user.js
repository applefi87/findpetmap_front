import { useUserStore } from 'stores/user';
import { api, apiAuth } from 'src/boot/axios';
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
    const res = await api.post('/email/sendForgetPWDCode', { ...emailObj, lang })
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
    if (error.action === "logout") {
      console.log("e-changePWD-logout");
      const users = useUserStore();
      users.clearLocalStorageAndCookie();
    }
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

export async function editInfo(form) {
  try {
    const formatForm = formatEditInfoForm(form)
    const res = await apiAuth.post('/user/editInfo', formatForm)
    return res
  } catch (error) {
    return error
  }
}
function formatEditInfoForm(form) {
  const copyForm = JSON.parse(JSON.stringify(form))
  copyForm.interfaceLanguage = copyForm.interfaceLanguage.value;
  copyForm.publishLanguages = languagesListObj2str(copyForm.publishLanguages)
  copyForm.searchLanguages = languagesListObj2str(copyForm.searchLanguages)
  return copyForm
}

export async function getMyBadges(form) {
  try {
    const res = await apiAuth.get('/user/getMyBadges')
    return res.data
  } catch (error) {
    return error
  }
}

export async function updateMyBadges(badges) {
  try {
    // const formatForm = formatEditInfoForm(form)
    const res = await apiAuth.post('/user/updateMyBadges', { badges })
    return res
  } catch (error) {
    return error
  }
}
