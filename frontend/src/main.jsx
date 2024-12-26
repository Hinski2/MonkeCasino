import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './styles/index.module.css'; 
import Greeting from './pages/Greeting'
// import Casino from './pages/Casino/Casino'
import Login from './pages/Login'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Greeting/>,
    },
    {
        path: '/login',
        element: <Login/>
    }
])

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);