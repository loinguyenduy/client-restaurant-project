import axios from "../utils/axios.js";

const getAllCategories = () => {
  return axios.get("api/v1/get-categories")
}

export {
  getAllCategories
}