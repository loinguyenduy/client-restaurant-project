import axios from "../utils/axios.js"

const getAllProducts = () => {
  return axios.get("api/v1/get-all-products")
}

export {
  getAllProducts
}