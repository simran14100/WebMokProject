export const getApiUrl = (endpoint = '') => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
  return `${baseUrl}${endpoint ? `/${endpoint}` : ''}`;
};

export const API_URL = getApiUrl();
