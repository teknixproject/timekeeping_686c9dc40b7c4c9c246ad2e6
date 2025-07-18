import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // const originalRequest = error.config;

    // if (error.response.status === 403 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   try {
    //     const refreshToken = localStorage.getItem('refresh_token');
    //     if (!refreshToken) {
    //       throw new Error('There is no refresh token');
    //     }

    //     const response: AxiosResponse = await axios.post(
    //       `${process.env.REACT_APP_SERVER_URL}/api/auth/refresh-token`,
    //       { token: refreshToken }
    //     );

    //     const newAccessToken = response.data.accessToken;
    //     localStorage.setItem('access_token', newAccessToken);

    //     originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

    //     return axios(originalRequest);
    //   } catch (error) {
    //     console.error('Access token error error', error);
    //     localStorage.removeItem('access_token');
    //     localStorage.removeItem('refresh_token');
    //     return Promise.reject(error);
    //   }
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
