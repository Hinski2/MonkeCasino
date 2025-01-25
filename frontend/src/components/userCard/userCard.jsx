import styles from './userCard.module.css'

export default function UserCard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const profilePicture = user.profilePicture;
    const nick = user.nick 
    const lvl = user.lvl
    const path_to_profile_picture = `/profile_pictures/${profilePicture}`;

    return (
        <div className={styles.card}>
            <img className={styles.card_img} src={path_to_profile_picture}/>
            <h2> {nick} </h2>
            <p> lvl: {lvl} </p>
        </div>
    );
}
