import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginApi, RegisterApi } from "../services/AuthService";
import axios from "axios";
import { toast } from "react-toastify";

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem('token');
        if(user && token){
            setUser(JSON.parse(user));
            setToken(token)
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        }
        setIsReady(true);
    }, []);

    const registerUser = async (first_name, last_name, email, password) => {
        await RegisterApi(first_name, last_name, email, password)
            .then((res) => {
                if(res?.success == true) {
                    localStorage.setItem("token", res?.data.token);
                    const userObj = {
                        first_name: res.data.first_name,
                        last_name: res.data.last_name,
                        email: res.data.email
                    }

                    localStorage.setItem("user", JSON.stringify(userObj));
                    setToken(res.data.token);
                    setUser(userObj);
                    toast.success(res.user_message);
                    navigate('casino')
                } else {
                    toast.error(res.user_message);
                }
            })
            .catch((e) => toast.warning(e));
    };

    const loginUser = async (email, password) => {
        await LoginApi(email, password)
            .then((res) => {
                if(res?.success == true) {
                    localStorage.setItem("token", res.data.token);
                    const userObj = {
                        first_name: res.data.first_name,
                        last_name: res.data.last_name,
                        email: res.data.email
                    }

                    localStorage.setItem("user", JSON.stringify(userObj));
                    setToken(res.data.token);
                    setUser(userObj);
                    toast.success(res.user_message);
                    navigate('casino')
                } else if (res) {
                    toast.error(res.user_message);
                }
            })
            .catch((e) => toast.warning(e));
    };

    const isLoggedIn = () => {
        return !!user;
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken("");
        navigate('/');
    }

    return (
        <UserContext.Provider value={{ loginUser, user, token, logout, isLoggedIn, registerUser }}>
            {isReady ? children : null }
        </UserContext.Provider>
    )
};

export const useAuth = () => React.useContext(UserContext);