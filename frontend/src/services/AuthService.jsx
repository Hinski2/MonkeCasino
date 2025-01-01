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

export const RegisterApi = async (first_name, last_name, email, password) => {
    try{
        const res = await axios.post(api + '/users/register', {
            "first_name": first_name, 
            "last_name": last_name,
            "email": email,
            "password": password
        })
        return res; 
    } catch(error){
        handleError(error);
    }
}