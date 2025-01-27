import styles from '../styles/BlackJack.module.css';
import { useAuth } from '../context/useAuth'
import React, { useState } from "react";
import { useEffect } from "react";
import { handleError } from '../utils/ErrorHandler.jsx';
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Blackjack = () => {
  const baseUrl = "http://127.0.0.1:8080";
  const  { getUserMe } = useAuth();
  const [token, setToken] = useState(null)
  const [balance, setBalance] = useState(null);
  const [bet, setBet] = useState(0);
  const [result, setResult] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

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
    
  },  [balance]);

	const getToken = async () => {
		const token2 = localStorage.getItem('token');
		const decodedToken = jwtDecode(token2);
		return decodedToken._id;
	}

const startNewGame = async () => {
    try {
		const user_id = await getToken();
		const response = await axios.post(`${baseUrl}/new_game`, {	
			balance: balance,
			bet: bet,
			user_id: user_id,
		});
      if(response.status !== 200) throw new Error("failed to start a new game")
      const data = response.data;
      setToken(data.token);
      setBalance(data.player_balance);
      setBet(bet);
      setResult(null);
      setPlayerHand(data.player_hand);
      setDealerHand(data.dealer_hand);
      setGameStarted(true);
    } catch (e) {
      handleError(e);
    }
  };

  const hit = async () => {
    if (!token) return;
    const response = await axios.post(`${baseUrl}/hit`, {
		token: token,
	});
	  const data = response.data;
    setPlayerHand(data.player_hand);
    if (data.game_over) {
      setResult(data.result);
      setGameStarted(false);
	    setBalance(0);
    }
  };

  const stand = async () => {
    if (!token) return;
    const response = await axios.post(`${baseUrl}/stand`, {
		token: token,
	});
	const data = response.data;
	
    setDealerHand(data.dealer_hand);
    setResult(data.result);
    setGameStarted(false);
	setBalance(0);
  };

  const doubleBet = async () => {
    if (!token) return;
    const response = await axios.post(`${baseUrl}/stand`, {
		token: token,
	});
    const data = response.data;
    setPlayerHand(data.player_hand);
    setDealerHand(data.dealer_hand);
    setBet(data.bet);
    setResult(data.result);
    setGameStarted(false);
	  setBalance(0);
  };

  const renderCards = (cards) => {
    return cards.map((card, index) => {
		const imagePath = `/cards/${card.rank}.jpg`.replace(/ /g, "_");

      return (
        <div key={index} className={styles.card} style={{ backgroundImage: `url(${imagePath})` }}>
        </div>
      );
    });
  };
	return (

		<div className={styles.blackjackWrapper}>


  <div className={styles.blackjackContainer}>
  {result && (
    <div
      className={`${styles.resultMessage} ${
        result === ("Player wins!" || "BlackJack!") ? styles.win :
        result === "Dealer wins!" ? styles.lose :
		result === "Player busts. Dealer wins!" ? styles.lose :
        styles.tie
      }`}
    >
      {result}
    </div>
  )}
    <div className={styles.hands}>
		<div className={styles.playerHand}>
		<div>
        <h3 className={styles.handLabel}>Player Hand:</h3></div>
        {renderCards(playerHand)}
		</div>
		<div className={styles.dealerHand}>
		<div><h3 className={styles.handLabel}>Dealer Hand:</h3></div>
        {renderCards(dealerHand)}
		</div>
    </div>
  </div>


  <div className={styles.navigation}>
	<div className={styles.buttons}>
    <button onClick={startNewGame} disabled={gameStarted}>New Game</button>
    <button onClick={hit} disabled={!gameStarted || !token}>Hit</button>
    <button onClick={stand} disabled={!gameStarted || !token}>Stand</button>
    <button onClick={doubleBet} disabled={!gameStarted || !token}>Double</button>
	</div>

		<div className={styles.header}>
    <div className={styles.infoContainer}>
		<h1 className={styles.title}>BlackJack</h1>
		<p className={styles.balance}><strong>Balance:</strong> ${balance}</p>
      <p className={styles.bet}><strong>Bet:</strong> ${bet}</p>
    </div>
  </div>
		</div>

  <div className={styles.sliderContainer}>
    <label htmlFor="bet-slider" className={styles.sliderLabel}>Set Bet: ${bet}</label>
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
</div>

	);

};

export default Blackjack;
