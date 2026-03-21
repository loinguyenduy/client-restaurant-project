import axios from '../utils/axios';

const addToCartApi = (product_id, quantity) => {
  return axios.post('/add-to-cart', { product_id, quantity });
}

export {
  addToCartApi
}