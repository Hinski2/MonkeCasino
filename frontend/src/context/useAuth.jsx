import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginApi, RegisterApi, LogoutApi, LogoutAllApi, ChangeDataApi, GetUserByIdApi} from "../services/AuthService";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../utils/ErrorHandler";
import { jwtDecode } from "jwt-decode";

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
    }, [token]);


    const registerUser = async (first_name, last_name, email, nick, password, profile_picture) => {
        await RegisterApi(first_name, last_name, email, nick, password, profile_picture)
            .then((res) => {
                if(res?.success == true) {
                    localStorage.setItem("token", res?.data.token);
                    const userObj = {
                        first_name: res.data.user.first_name,
                        nick: res.data.user.nick,
                        last_name: res.data.user.last_name,
                        email: res.data.user.email,
                        lvl: res.data.user.lvl, 
                        experiencePoints: res.data.user.experiencePoints,
                        profilePicture: res.data.user.profilePicture
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
            .catch((e) => handleError(e));
    };

    const loginUser = async (email, password) => {
        await LoginApi(email, password)
            .then((res) => {
                if(res?.success == true) {
                    localStorage.setItem("token", res.data.token);
                    const userObj = {
                        first_name: res.data.user.first_name,
                        nick: res.data.user.nick,
                        last_name: res.data.user.last_name,
                        email: res.data.user.email,
                        lvl: res.data.user.lvl, 
                        experiencePoints: res.data.user.experiencePoints,
                        profilePicture: res.data.user.profilePicture
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
            .catch((e) => handleError(e));
    };

    const isLoggedIn = () => {
        return !!user;
    }

    const logout = async () => {
        await LogoutApi()
            .then((res) => {
                toast.success(res.user_message);

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setToken("");
                navigate('/');
            })
            .catch((e) => handleError(e));
    }

    const logoutAll = async () => {
        await LogoutAllApi()
            .then((res) => {
                toast.success(res.user_message);

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setToken("");
                navigate('/');
            })
            .catch((e) => handleError(e));
    }

    const dataChange = async (data) => {
        await ChangeDataApi(data)
            .then((res) => {
                const userObj = {
                        first_name: res.data.first_name,
                        nick: res.data.nick,
                        last_name: res.data.last_name,
                        email: res.data.email,
                        lvl: res.data.lvl, 
                        experiencePoints: res.data.experiencePoints,
                        profilePicture: res.data.profilePicture
                    }

                localStorage.setItem("user", JSON.stringify(userObj));
                setUser(userObj);
                toast.success(res.user_message);
            })
            .catch((e) => handleError(e));
    }

    const getUserById = async (id) => {
        await GetUserByIdApi(id)
            .then((res) => {
                const userObj = {
                    nick: res.data.nick, 
                    lvl: res.data.lvl, 
                    accoutBalance: res.data.accoutBalance,
                    experiencePoints: res.data.experiencePoints,
                    profilePicture: res.data.profilePicture
                } 
                
                return userObj;
            })
            .catch((e) => handleError(e));
    }

    const getUserMe = async () => {
        try{
            if(!token){
                throw new Error("token is missing. plase log in")
            }

            const decodedToken = jwtDecode(token);
            const id = decodedToken._id;

            const res = await GetUserByIdApi(id);
            const userObj = {
                nick: res.data.nick, 
                lvl: res.data.lvl, 
                accoutBalance: res.data.accoutBalance,
                experiencePoints: res.data.experiencePoints,
                profilePicture: res.data.profilePicture
            } 
            
            return userObj;
        } catch (e) {
            handleError(e);
            return null;
        }


    }

    return (
        <UserContext.Provider value={{ loginUser, user, token, logout, isLoggedIn, registerUser, logoutAll, dataChange, getUserById, getUserMe }}>
            {isReady ? children : null }
        </UserContext.Provider>
    )
};

export const useAuth = () => React.useContext(UserContext);