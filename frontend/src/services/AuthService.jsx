import axios from "axios";
import { handleError } from "../utils/ErrorHandler";

const api = "http://localhost:3000/api/";

export const LoginApi = async (email, password) => {
    try {
        const { data } = await axios.post(api + 'users/login', {
            email: email,
            password: password
        });

        return data;
    } catch(error){
        console.log(error.response.data);
        handleError(error.response?.data ? error.response.data : error);
    }
}

export const RegisterApi = async (first_name, last_name, email, nick, password, profile_picture) => {
    try{
        const { data } = await axios.post(api + 'users/register', {
            "first_name": first_name, 
            "last_name": last_name,
            "email": email,
            "nick": nick,
            "password": password,
            "profilePicture": profile_picture
        })
        return data; 
    } catch(error){
        handleError(error);
    }
}

export const LogoutApi = async () => {
    try{
        const { data } = await axios.post(api + 'users/logout');
        return data;
    } catch (error){
        handleError(error);
    }
};

export const LogoutAllApi = async () => {
    try{
        const { data } = await axios.post(api + 'users/logoutAll');
        return data;
    } catch (error){
        handleError(error);
    }
};

export const ChangeDataApi = async (form) => {
    try{
        const { data } = await axios.patch(api + 'users/me', form);
        return data;
    } catch (error){
        handleError(error);
    }
}