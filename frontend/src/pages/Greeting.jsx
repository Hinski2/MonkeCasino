import styles from '../styles/Greeting.module.css'
import { useNavigate } from 'react-router-dom';

export default function Greeting(){
    const navigate = useNavigate();

    return(
        <div className={styles.mainContainer}>
            <button className={styles.startGamblingButton} onClick={() => navigate('/login')}> Start Gambling </button>
        </div>
    );
}