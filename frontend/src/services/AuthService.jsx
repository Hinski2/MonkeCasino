import axios from "axios";

const api = "http://localhost:3000/api"

export const LoginApi = async (email, password) => {
    try{
        const data = await axios.post(api + '/login', {
            email: email,
            password: password
        });

        return data;
    } catch(error){
        console.log(error);
    }
}

export const ReginsterApi = async (first_name, last_name, email, password) => {
    try{
        const data = await axios.post(api + '/register', {
            "first_name": first_name, 
            "last_name": last_name,
            "email": email,
            "password": password
        })
        return data; 
    } catch(error){
        console.log(error)
    }
}