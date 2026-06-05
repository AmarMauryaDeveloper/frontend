import axios from 'axios';

let accessToken = localStorage.getItem('accessToken') || null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial to send HttpOnly cookies (refreshToken)
});

// Request Interceptor: Attach Access Token + handle FormData
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If the request body is FormData, remove the hardcoded JSON content-type
    // so the browser can automatically set the correct multipart/form-data boundary.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Rotate Access Token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and request has not retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If the request path is login, don't attempt to refresh token
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function (resolve, reject) {
        // Attempt to call the refresh endpoint
        axios
          .post('/api/auth/refresh', {}, { withCredentials: true })
          .then(({ data }) => {
            if (data.success && data.accessToken) {
              setAccessToken(data.accessToken);
              api.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
              originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
              processQueue(null, data.accessToken);
              resolve(api(originalRequest));
            } else {
              processQueue(new Error('Token refresh failed'), null);
              reject(error);
            }
          })
          .catch((err) => {
            processQueue(err, null);
            // If refresh token is invalid/expired, log out the user
            setAccessToken(null);
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
