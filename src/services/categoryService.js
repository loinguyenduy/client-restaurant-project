import axios from "../utils/axios.js";

const getAllCategories = () => {
  return axios.get("/get-categories")
}

export {
  getAllCategories
}