// API configuration that works in both development and production
const getApiBaseUrl = () => {
  // In production, the API is served from the same domain
  if (import.meta.env.PROD) {
    return window.location.origin
  }
  
  // In development, use the local backend server
  return import.meta.env.VITE_API_URL || 'http://localhost:8787'
}

export const API_BASE_URL = getApiBaseUrl()

// Configure axios globally
import axios from 'axios'
axios.defaults.baseURL = API_BASE_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Add auth token to requests if it exists
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axios