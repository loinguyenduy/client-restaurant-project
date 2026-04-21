import { FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS, FETCH_USER_ACCOUNT_SUCCESS } from '../actions/authAction';

const INITIAL_STATE = {
    account: {
        email: '',
        username: '',
        role: '',
        phone_number: ''
    },
    isAuthenticated: false,
    token: ''
};

const authReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
        case FETCH_USER_ACCOUNT_SUCCESS:               
            // console.log("Check action payload: ", action.payload);
            return {
                ...state,
                account: {
                    email: action.payload.email,
                    username: action.payload.username,
                    role: action.payload.role,
                    phone_number: action.payload.phone_number || ''
                },
                isAuthenticated: true,
                token: action.payload.accessToken
            };

        case USER_LOGOUT_SUCCESS:
            return {
                ...INITIAL_STATE
            };

        default:
            return state; 
    }
};

export default authReducer;