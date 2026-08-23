import {
  FETCH_USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  FETCH_USER_ACCOUNT_SUCCESS,
  UPDATE_USER_INFO,
} from "../actions/authAction";

const INITIAL_STATE = {
  account: {
    id: "",
    email: "",
    username: "",
    role: "",
    phone_number: "",
  },
  isAuthenticated: false,
  token: "",
};

const authReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_USER_LOGIN_SUCCESS:
    case FETCH_USER_ACCOUNT_SUCCESS:
      // console.log("Check action payload: ", action.payload);
      return {
        ...state,
        account: {
          id: action.payload.id,
          email: action.payload.email,
          username: action.payload.username,
          role: action.payload.role,
          phone_number: action.payload.phone_number || "",
          full_name: action.payload.full_name,
          gender: action.payload.gender,
        },
        isAuthenticated: true,
        token: action.payload.accessToken,
      };

    case USER_LOGOUT_SUCCESS:
      return {
        ...INITIAL_STATE,
      };
    case UPDATE_USER_INFO:
      return {
        ...state,
        account: {
          ...state.account,
          full_name: Object.prototype.hasOwnProperty.call(action.payload, "full_name")
            ? action.payload.full_name
            : state.account.full_name,
          phone_number: Object.prototype.hasOwnProperty.call(action.payload, "phone_number")
            ? action.payload.phone_number || ""
            : state.account.phone_number,
          gender: Object.prototype.hasOwnProperty.call(action.payload, "gender")
            ? action.payload.gender
            : state.account.gender,
        },
      };
    default:
      return state;
  }
};

export default authReducer;
