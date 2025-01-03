import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Casino(){
    const { logout, logoutAll } = useAuth();
    return(
        <>
            <h1> Casino </h1>

            <Link to='/casino/profile'>
                <button>
                    Go to profile
                </button>
            </Link>

            <button onClick={logout}>
                Logout
            </button>

            <button onClick={logoutAll}>
                LogoutAll
            </button>
        </>
    );
}