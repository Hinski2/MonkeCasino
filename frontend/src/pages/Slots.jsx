import styles from '../styles/Slots.module.css'
import { useAuth } from '../context/useAuth'
import React, { useState } from "react";
import { useEffect } from "react";
import { handleError } from '../utils/ErrorHandler.jsx';
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from 'react-toastify';

export default function Slots(){
    const baseUrl = "77.255.162.181:3030";
    const { getUserMe } = useAuth();
    const [balance, setBalance] = useState(null);
    const [win, setWin] = useState(10);
    const [img1, setImg1] = useState('/cards/Queen_of_Diamonds.jpg');
    const [img2, setImg2] = useState('/cards/Queen_of_Diamonds.jpg');
    const [img3, setImg3] = useState('/cards/Queen_of_Diamonds.jpg');
    const ranks = [
        'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Jack', 'Queen', 'King', 'Ace'
    ];

    useEffect(() => {
        const fetchUserBalance = async () => {
            try {
                const userData = await getUserMe();
                setBalance(userData.accoutBalance);
            } catch (e) {
                handleError(e);
            }
        }

        fetchUserBalance();
    },  []);

    const get_card_image = (idx) => {
        try {
            if (idx < 0 || idx >= ranks.length) {
                throw new Error("Invalid index");
            }

            return `/cards/${ranks[idx]}_of_Diamonds.jpg`;
        } catch (e) {
            handleError(e)
        }
    }

    const getRandomCard = () => {
        const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
        return `/cards/${randomRank}_of_Diamonds.jpg`;
    };

    const animateCards = () => {
        const animationDuration = 3000; // time in ms
        const interval = 120;  // interval in ms
        let elapsedTime = 0;

        const intervalId = setInterval(() => {
            setImg1(getRandomCard());
            setImg2(getRandomCard());
            setImg3(getRandomCard());
            elapsedTime += interval;

            if (elapsedTime >= animationDuration) {
                clearInterval(intervalId);
            }

        }, interval);

        return new Promise((resolve) => setTimeout(resolve, animationDuration)); 
    };

    const getToken = async () => {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        return decodedToken._id;
    }

    const pull = async (cash) => {
        if(balance < cash){
            return toast.error("You don't have enough money")
        }
        
        try {
            const id = await getToken();
            // const res = await axios.post(baseUrl + '/slots', {
            //     balance: balance,
            //     bet: cash, 
            //     user_id: id
            // });

            // sprawdzamy czy wszystko ok jeśli tak
            animateCards();

            // ustaw właściwe karty 

        } catch (e) {
            handleError(e);
        }
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.navbar}>
                 <h1> MonkeCasino </h1>
                 <h1> Balance: {balance} </h1>
            </div>
            <div className={styles.machine}>

                <div className={styles.cardContainer}>
                    <img src={img1} className={styles.img1}/>
                    <img src={img2} className={styles.img2}/>
                    <img src={img3} className={styles.img3}/>
                </div>

                <div className={styles.buttonContainer}>
                    <button onClick={ () => pull(10)} className={`${styles.button} ${balance < 10 ? styles.disabled : ''}`}>
                        Pull for 10$
                    </button>
                    <button onClick={ () => pull(50)} className={`${styles.button} ${balance < 50 ? styles.disabled : ''}`}>
                        Pull for 50$
                    </button>
                    <button onClick={ () => pull(100)} className={`${styles.button} ${balance < 100 ? styles.disabled : ''}`}>
                        Pull for 100$
                    </button>
                    <button onClick={ () => pull(250)} className={`${styles.button} ${balance < 250 ? styles.disabled : ''}`}>
                        Pull for 250$
                    </button>
                </div>

                {win !== null && <h2 className={styles.lastWin}>Last win: {win}$</h2>}
            </div>
        </div>
    );
}

