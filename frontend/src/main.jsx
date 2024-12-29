import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './styles/index.module.css'; 
import Routes from './routes/Routes'
import { UserProvider } from "./context/useAuth";

const router = createBrowserRouter(Routes);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
