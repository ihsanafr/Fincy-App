import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // If sending FormData, let the browser set the correct multipart boundary.
    if (config.data instanceof FormData) {
      // Axios may merge defaults; ensure we don't force JSON.
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    } else {
      // Default to JSON for normal requests
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

