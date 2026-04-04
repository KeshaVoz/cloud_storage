import React from "react";
import {useAuthContext} from "./AuthContext.jsx";
import {Navigate} from "react-router-dom";

const AvailableAfterLoginRoute = ({children}) => {
    const {auth} = useAuthContext();

    return auth.isAuthenticated
        ? children
        : <Navigate to="/login"/>;

};

export default AvailableAfterLoginRoute;