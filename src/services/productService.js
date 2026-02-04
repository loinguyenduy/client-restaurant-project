import axios from "../utils/axios.js"

const getAllProducts = (categoryId) => {
  return axios.get("api/v1/get-all-products", {params: {category_id: categoryId}})
}

export {
  getAllProducts
}