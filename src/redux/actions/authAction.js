export const FETCH_USER_LOGIN_SUCCESS = "FETCH_USER_LOGIN_SUCCESS";
export const USER_LOGOUT_SUCCESS = "USER_LOGOUT_SUCCESS";
export const FETCH_USER_ACCOUNT_SUCCESS = "FETCH_USER_ACCOUNT_SUCCESS"; 
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';

//Login action
export const doLoginSuccess = (userInfo) => {
  // console.log(">>> check userInfo: ", userInfo)
  return {
    type: FETCH_USER_LOGIN_SUCCESS,
    payload: userInfo,
  };
};

//Logout action
export const doLogoutSuccess = () => {
  return {
    type: USER_LOGOUT_SUCCESS,
  };
};

export const doFetchAccountSuccess = (userInfo) => {
  return {
    type: FETCH_USER_ACCOUNT_SUCCESS,
    payload: userInfo,
  };
};

export const doUpdateUserInfo = (userData) => {
    return {
        type: UPDATE_USER_INFO,
        payload: userData
    };
};