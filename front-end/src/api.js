import axios from 'axios';

const API_URL = '/api/warden'; // This works with React's proxy

export const getWardens = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addWarden = async (warden) => {
  const response = await axios.post(API_URL, warden);
  return response.data;
};

export const getWardenById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateWarden = async (id, warden) => {
  const response = await axios.put(`${API_URL}/${id}`, warden);
  return response.data;
};

export const deleteWarden = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
