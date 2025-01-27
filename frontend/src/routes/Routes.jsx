import ProtectedRoute from "./ProtectedRoute";
import { lazy } from "react";
import App from "../App";

// import sites
const Greeting = lazy(
    () => import('../pages/Greeting')
);

const Login = lazy(
    () => import('../pages/Login')
);

const Register = lazy(
    () => import('../pages/Register')
);

const ForgotPassword = lazy(
    () => import('../pages/ForgotPassword')
);

const Casino = lazy(
    () => import('../pages/Casino')
);

const Profile = lazy(
    () => import('../pages/Profile')
);

const Forbidden = lazy(
    () => import('../pages/Forbidden')
);

const NotFound = lazy(
    () => import('../pages/NotFound')
);

const ProfilePicturePicker = lazy(
    () => import('../pages/ProfilePicturePicker')
)

const BlackJack = lazy(
	() => import('../pages/BlackJack')
)

const Slots = lazy(
    () => import('../pages/Slots')
)

const Roulette = lazy(
    () => import('../pages/Roulette')
)

const Routes = [
    {
        path: '/',
        element: <App />,
        children: [
            // public routes
            {
                index: true,
                element: <Greeting />
            }, 
            {
                path: '/login', 
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            },
            {
                path: '/forgotPassword',
                element: <ForgotPassword />
            },

            // protected routes
            {
                path: '/casino',
                element: <ProtectedRoute />,
                children: [
                    {
                        index: true,
                        element: <Casino />
                    },
                    {
                        path: 'profile',
                        element: <Profile />
                    },
                    {
                        path: 'profilePicturePicker',
                        element: <ProfilePicturePicker />
                    },
					{
						path: 'blackjack',
						element: <BlackJack />
					},
                    {
                        path: 'slots',
                        element: <Slots />
                    },
                    {
                        path: 'roulette',
                        element: <Roulette />
                    }
                ]
            },
            {
                path: '/api',
                element: <ProtectedRoute />,
                children: [
                    {
                        path: 'users',
                        element: <Forbidden/>
                    }
                ]
            },

            // not found
            {
                path: '*',
                element: <NotFound/>
            }
        ]
    }
]

export default Routes
