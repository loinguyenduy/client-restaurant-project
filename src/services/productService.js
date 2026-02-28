import axios from "../utils/axios.js"

const getAllProducts = (options) => {
  return axios.get(`api/v1/get-all-products`, {
    params: options 
  });
}

export {
  getAllProducts
}