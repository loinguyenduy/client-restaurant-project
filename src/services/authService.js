import axios from '../utils/axios';


const registerUserApi = (email, username, password, fullName, phone, gender) => {
    return axios.post('/register', {
        email: email,
        username: username,
        password: password,
        full_name: fullName, 
        phone_number: phone, 
        gender: gender
    });
};


const loginUserApi = (valueLogin, password) => {
    return axios.post('/login', {
        valueLogin: valueLogin,
        password: password
    });
};


const logoutUserApi = () => {
    return axios.post('/logout');
};

const fetchAccountApi = () => {
    return axios.post('/refresh'); 
};

export { 
    registerUserApi, 
    loginUserApi, 
    logoutUserApi,
    fetchAccountApi 
};