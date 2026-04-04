import './App.css'

import {BrowserRouter, Route, Routes} from "react-router-dom";
import {BaseLayout} from "./pages/BaseLayout.jsx";
import {GlobalProvider} from "./context/GlobalProvider.jsx";
import {SignIn} from "./pages/SignIn.jsx";
import {SignUp} from "./pages/SignUp.jsx";
import Index from "./pages/Index.jsx";
import UnavailableAfterLoginRoute from "./context/Auth/UnavailableAfterLoginRoute.jsx";
import AvailableAfterLoginRoute from "./context/Auth/AvailableAfterLoginRoute.jsx";
import Files from "./pages/Files.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

function App() {


    return (
        <BrowserRouter basename={import.meta.env.VITE_BASE}>
            <GlobalProvider>
                <Routes>
                    <Route element={<BaseLayout/>}>
                        <Route index element={<Index/>}/>

                        <Route path="*" element={<ErrorPage />}/>

                        {/*available before login only*/}
                        <Route path="login"
                               element={
                                   <UnavailableAfterLoginRoute>
                                       <SignIn/>
                                   </UnavailableAfterLoginRoute>
                               }/>

                        <Route path="registration"
                               element={
                                   <UnavailableAfterLoginRoute>
                                       <SignUp/>
                                   </UnavailableAfterLoginRoute>
                               }/>

                        {/*available after login only*/}

                        <Route path="files/*"
                               element={
                                   <AvailableAfterLoginRoute>
                                       <Files/>
                                   </AvailableAfterLoginRoute>
                               }/>

                    </Route>
                </Routes>
            </GlobalProvider>
        </BrowserRouter>
    )
}

export default App
