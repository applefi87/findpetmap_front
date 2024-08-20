import axios from 'axios';
import { i18n } from './i18n.js';
import { useUserStore } from 'src/stores/user';
import notify from 'src/utils/notify.js'
// 介紹: 成功就不說
// 如果失敗，會用handleError 翻譯，取出標準格式throw, 所以操作的一樣要有catch

const t = i18n.global.t;

function handleApiResponse(response) {
  if (!response) {
    // Throw an error when there is no response object
    throw new Error('Request failed', createErrorResponse(t('errors.requestFailed')));
  }
  const { data } = response;
  if (!data.success) {
    // Throw an error when the response object has a success property set to false
    translateDataMessage(data || 'responseFailed')
    // const finalErrorMsg = createErrorResponse(data)
    // console.log(finalErrorMsg);
    throw new Error('Response failed', data);
  }
  translateDataMessage(data);
  return data;
}

async function handleApiError(error) {
  const result = processApiError(error)
  await notify(result)
  return result;
}

// ---這趨穩定了之後拔掉log
async function handleApiAuthError(error) {
  const { response, config } = error;
  if (response && response.status === 401) {
    const users = useUserStore();
    if (config.url !== '/user/extend' && config.url !== '/user/logout') {
      let isExtend = true
      try {
        await extendToken(users, config);
        // log(`reget data: ${JSON.stringify(config)}`);
        isExtend = false
        const { data } = await axios(config);
        return data
      } catch (err) {
        if (isExtend) {
          // log("handleAuthApiError>401>extendErr:" + JSON.stringify(err));
          const resError = { response: { data: { success: false, message: { title: "loginExpired" } } } }
          const res = await processApiError(resError);
          users.clearLocalStorageAndCookie();
          await notify(res)
          // 透過這裡通知登入過期的，用下面方法避免丟error觸發其他頁面的自動notify error
          return { success: false }
        } else {
          log("handleAuthApiError>401>afterExtendErr:");
          // If original doing(After extend.) fails, clear the local storage and reject the Promise with the error
          throw await processApiError(err);
        }
      }
    } else {
      users.clearLocalStorageAndCookie()
      throw await processApiError(error);
    }
  }
  throw await processApiError(error);
}

// ---

const api = axios.create({
  baseURL: process.env.SERVER_URL,
  withCredentials: true,
  headers: import.meta.env.SSR ? { Origin: 'https://knowforum.com' } : {}
});

const apiAuth = axios.create({
  baseURL: process.env.SERVER_URL,
  withCredentials: true,
  headers: import.meta.env.SSR ? { Origin: 'https://knowforum.com' } : {}
});

apiAuth.interceptors.request.use((config) => {
  const users = useUserStore();
  config.headers.authorization = `Bearer ${users.token}`;
  return config;
});

api.interceptors.response.use(handleApiResponse, handleApiError);
apiAuth.interceptors.response.use(handleApiResponse, handleApiAuthError);

export { api, apiAuth };


//
function processApiError(error) {
  const errorMessage = error?.response?.data || createErrorResponse('axiosObj.resFormatErr');
  translateDataMessage(errorMessage);
  return errorMessage;
}

function createErrorResponse(errorMessage) {
  return {
    success: false,
    message: {
      title: errorMessage
    },
  };
}

function translateDataMessage(data) {
  if (!data.message) {
    data.message = { title: "" }
  } else if (typeof data.message?.title === 'object') {
    const { key, params } = data.message.title;
    data.message.title = t(key, params);
  } else {
    // data.message.title = data.message.title
  }
}
//
function log(message) {
  console.log(message);
}
async function extendToken(users, config) {
  log("extend token");
  const { data } = await apiAuth.post('/user/extend', {});
  users.extendToken(data.token)
  config.headers.authorization = `Bearer ${data.token}`;
  log("extend token end");
}
