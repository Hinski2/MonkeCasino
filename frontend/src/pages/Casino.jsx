import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import styles from '../styles/Casino.module.css'
import { AiOutlineSetting } from "react-icons/ai";

export default function Casino(){
    const { lvl, nick } = JSON.parse(localStorage.getItem('user'));
    const { logout, logoutAll } = useAuth();

    return(
        <div className={styles.mainContainer}>
            <div className={styles.navbar}>
                <div className={styles.leftSection}>
                    <h1 className={styles.title}>MonkeCasino</h1>
                    <div className={styles.navLinks}>
                        <Link to="ranking" className={styles.navButton}>
                            Ranking
                        </Link>
                        <Link to="stats" className={styles.navButton}>
                            Stats
                        </Link>
                    </div>
                </div>
                <div className={styles.rightSection}>
                    <button onClick={logout} className={styles.navButton}>
                        Logout
                    </button>
                    <Link to="profile" className={styles.profile}>
                        <AiOutlineSetting className={styles.icon} />
                        <span className={styles.nick}>{nick}</span>
                        <span className={styles.lvl}>{lvl}</span>
                    </Link>
                </div>
            </div>
            
            <div className={styles.centerButtons}>
                <Link to="slots">
                    <button className={styles.gameButton}>Slots</button>
                </Link>
                <Link to="roulette">
                    <button className={styles.gameButton}>Rulette</button>
                </Link>
                <Link to="blackjack">
                    <button className={styles.gameButton}>Black Jack</button>
                </Link>
                <Link to="poker">
                    <button className={styles.gameButton}>Poker</button>
                </Link>
            </div>
        </div>
    );
}
