import axios from "../utils/axios.js"

const getAllProducts = (options) => {
  return axios.get(`/get-all-products`, {
    params: options 
  });
}

export {
  getAllProducts
}