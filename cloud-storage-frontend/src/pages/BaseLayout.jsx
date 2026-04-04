import {Outlet} from "react-router-dom";
import Header from "../components/Header/Header.jsx";


export const BaseLayout = () => {

    return (
        <>
            <Header/>
            <Outlet/>
        </>
    )
}