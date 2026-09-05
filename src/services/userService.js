import axios from "../utils/axios";

const updateProfileApi = (userData) => {
    return axios.put('/users/update-profile', userData);
};

const changePasswordApi = (passwordData) => {
    return axios.put('/users/change-password', passwordData);
};

export { updateProfileApi, changePasswordApi };