import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Replace with your backend URL

export const fetchShopifyCustomers = async () => {
  return axios.get(`${API_URL}/shopifyCustomers`).then(response => response.data);
};

export const fetchShopifyOrders = async () => {
  return axios.get(`${API_URL}/shopifyOrders`).then(response => response.data);
};

export const fetchShopifyProducts = async () => {
  return axios.get(`${API_URL}/shopifyProducts`).then(response => response.data);
};
