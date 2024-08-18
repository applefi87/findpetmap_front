import { apiAuth } from 'src/boot/axios'

export const uploadImage = async (file, route) => {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await apiAuth.post(`/image/add/${route}`, formData);
    return res;
  } catch (error) {
    console.error(error);
    return null;
  }
};
