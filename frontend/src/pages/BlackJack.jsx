import styles from '../styles/BlackJack.module.css';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/useAuth'
import { GetUserByIdApi } from '../services/AuthService.jsx';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import React, { useState } from "react";

const Blackjack = () => {
  const baseUrl = "http://127.0.0.1:8080";
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [result, setResult] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const startNewGame = async () => {
    const response = await fetch(`${baseUrl}/new_game?balance=1000`);
    const data = await response.json();
    setToken(data.token);
    setBalance(data.player_balance);
    setBet(bet);
    setResult(null);
    setPlayerHand(data.player_hand);
    setDealerHand(data.dealer_hand);
    setGameStarted(true);
  };

  const hit = async () => {
    if (!token) return;
    const response = await fetch(`${baseUrl}/hit/${token}`);
    const data = await response.json();
    setPlayerHand(data.player_hand);
    if (data.game_over) {
      setResult(data.result);
      setGameStarted(false);
    }
  };

  const stand = async () => {
    if (!token) return;
    const response = await fetch(`${baseUrl}/stand/${token}`);
    const data = await response.json();
    setDealerHand(data.dealer_hand);
    setResult(data.result);
    setGameStarted(false);
  };

  const doubleBet = async () => {
    if (!token) return;
    const response = await fetch(`${baseUrl}/double/${token}`);
    const data = await response.json();
    setPlayerHand(data.player_hand);
    setDealerHand(data.dealer_hand);
    setBet(data.bet);
    setResult(data.result);
    setGameStarted(false);
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
  {result && (
    <div
      className={`${styles.resultMessage} ${
        result === "Player wins!" ? styles.win :
        result === "Dealer wins!" ? styles.lose :
		result === "Player busts. Dealer wins!" ? styles.lose :
        styles.tie
      }`}
    >
      {result}
    </div>
  )}

  <div className={styles.blackjackContainer}>
    <div className={styles.hands}>
      <div className={styles.playerHand}>
        <h3 className={styles.handLabel}>Player Hand:</h3>
        {renderCards(playerHand)}
      </div>
      <div className={styles.dealerHand}>
        <h3 className={styles.handLabel}>Dealer Hand:</h3>
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
