import { api, apiAuth } from 'src/boot/axios';


export const apiCallToPostRegion = async (bottomLeft, topRight) => {
  return await api.post('/article/', {
    bottomLeft,
    topRight
  })
};
