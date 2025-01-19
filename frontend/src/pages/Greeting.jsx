import styles from '../styles/Greeting.module.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Greeting(){
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth()

    return(
        <div className={styles.mainContainer}>
            <button className={styles.startGamblingButton} onClick={() => isLoggedIn() ? navigate('/casino') : navigate('/login')}>
                Start Gambling 
            </button>
        </div>
    );
}