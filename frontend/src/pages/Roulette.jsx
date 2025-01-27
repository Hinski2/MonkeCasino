import styles from '../styles/Roulette.module.css'
import { useAuth } from '../context/useAuth'
import React, { useState } from "react";
import { useEffect } from "react";
import { handleError } from '../utils/ErrorHandler.jsx';
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from 'react-toastify';
import { Wheel } from 'react-custom-roulette'

const rouletteData = [
  { option: '0',  style: { backgroundColor: 'green', textColor: 'white' } },
  { option: '32', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '15', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '19', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '4',  style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '21', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '2',  style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '25', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '17', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '34', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '6',  style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '27', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '13', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '36', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '11', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '30', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '8',  style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '23', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '10', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '5',  style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '24', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '16', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '33', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '1',  style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '20', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '14', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '31', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '9',  style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '22', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '18', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '29', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '7',  style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '28', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '12', style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '35', style: { backgroundColor: 'black', textColor: 'white' } },
  { option: '3',  style: { backgroundColor: 'red',   textColor: 'white' } },
  { option: '26', style: { backgroundColor: 'black', textColor: 'white' } },
];

export default function Roulette(){
    const baseUrl = "77.255.162.181:3030";
    const { getUserMe } = useAuth();
    const [balance, setBalance] = useState(null);
    const [bet, setBet] = useState(10);

    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [selectedBetOption, setSelectedBetOption] = useState('')

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

    const getToken = async () => {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        return decodedToken._id;
    }

    const handleSpinClick = async () => {
        if(balance < bet){
            return toast.error("You don't have enough money")
        }

        try {
            const id = await getToken();

            // if everything ok
            if (!mustSpin) {
                const newPrizeNumber = Math.floor(Math.random() * rouletteData.length);
                setPrizeNumber(newPrizeNumber);
                setMustSpin(true);
            }

        } catch (e) {
            handleError(e);
        }
    };

    const handleBetOptionClick = (option) => {
        setSelectedBetOption(option)
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftDiv}>
                <div className={styles.roulette_container}>
                    <Wheel
                        mustStartSpinning={mustSpin}
                        prizeNumber={prizeNumber}
                        data={rouletteData}
                        onStopSpinning={() => setMustSpin(false)}
                        spinDuration={0.5}
                        textDistance={80}
                        outerBorderWidth={8}
                        outerBorderColor="black"
                        radiusLineWidth={3}
                        radiusLineColor="black"
                        fontSize={20}
                        fontWeight="bold"
                    />
                </div>
            </div>

            <div className={styles.rightDiv}>
                <h1> Balance: {balance} </h1>
                <div className={styles.sliderContainer}>
                    <label htmlFor="bet-slider" className={styles.sliderLabel}>
                        Set Bet: ${bet}
                    </label>
                    <input
                        id="bet-slider"
                        type="range"
                        min="10"
                        max={balance}
                        value={bet}
                        onChange={(e) => setBet(Number(e.target.value))}
                        className={styles.slider}
                    />
                </div>

                <button className={styles.spinButton} onClick={handleSpinClick}> SPIN </button>
                <div className={styles.betButtonsContainer}>
                    <button className={`${styles.betButton} ${selectedBetOption === '0-11' ? styles.active : ''}`} onClick={() => handleBetOptionClick('0-11')}> 0-11 </button>
                    <button className={`${styles.betButton} ${selectedBetOption === '12-23' ? styles.active : ''}`} onClick={() => handleBetOptionClick('12-23')}> 12-23 </button>
                    <button className={`${styles.betButton} ${selectedBetOption === '24-35' ? styles.active : ''}`} onClick={() => handleBetOptionClick('24-35')}> 24-35 </button>
                    <button className={`${styles.betButton} ${selectedBetOption === 'even' ? styles.active : ''}`} onClick={() => handleBetOptionClick('even')}> even </button>
                    <button className={`${styles.betButton} ${selectedBetOption === 'odd' ? styles.active : ''}`} onClick={() => handleBetOptionClick('odd')}> odd </button>
                    <button className={`${styles.betButton} ${selectedBetOption === 'red' ? styles.active : ''}`} onClick={() => handleBetOptionClick('red')}> red </button>
                    <button className={`${styles.betButton} ${selectedBetOption === 'black' ? styles.active : ''}`} onClick={() => handleBetOptionClick('black')}> black </button>
                    <button className={`${styles.betButton} ${selectedBetOption === 'green' ? styles.active : ''}`} onClick={() => handleBetOptionClick('green')}> green </button>
                </div>
            </div>
        </div>
    )
}