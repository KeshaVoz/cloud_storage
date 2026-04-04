import React, {createContext, useContext, useEffect, useState} from "react";
import {checkSession} from "../../services/fetch/auth/user/CheckSession.js";
import {useLocation, useNavigate} from "react-router-dom";
import {useNotification} from "../Notification/NotificationProvider.jsx";

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {

    const [auth, setAuth] = useState(extractAuthUser);

    function extractAuthUser() {
        const isAuth = localStorage.getItem("isAuthenticated");
        const userData = localStorage.getItem("user");

        if (isAuth && userData) {
            return {isAuthenticated: true, user: JSON.parse(userData)};
        }
        return {isAuthenticated: false, user: null};
    }

    const login = (userInfo) => {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(userInfo));
        setAuth({isAuthenticated: true, user: userInfo});
    }

    const logout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");
        setAuth({isAuthenticated: false, user: null});
    }


    const urlLocation = useLocation();
    const [pageVisits, setPageVisits] = useState(0);
    const navigate = useNavigate();

    const {showError} = useNotification();
    const validateSession = async () => {
        if (auth.isAuthenticated) {
            try {
                const user = await checkSession();
                console.log(user);
                if (user !== auth.user) {
                    login(user);
                }
            } catch (error) {
                logout();
                setTimeout(() => {
                    navigate("/login");
                    showError("Session is expired! Please login again", 4000)
                }, 300)
            }
        }
    };

    const validateCookieIsAlive = async () => {
        if (!auth.isAuthenticated) {
            try {
                const user = await checkSession();
                if (user) {
                    login(user);
                }
            } catch (error) {
                console.log('Session not present')
            }
        }
    };

    useEffect(() => {
        setPageVisits((prev) => prev + 1);

        if (pageVisits >= 3) {
            validateSession();
            setPageVisits(0);
        }
    }, [urlLocation.pathname]);


    useEffect(() => {
        validateSession();
        validateCookieIsAlive();
    }, []);


    return (
        <AuthContext.Provider value={{auth, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};