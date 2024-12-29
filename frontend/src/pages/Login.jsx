import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import styles from '../styles/Login.module.css';
import { useState } from "react";

export default function Login() {
  const [user, setUser] = useState();
  const handleLogin = async() => {
    const {success, message} = await Login
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.leftContainer}>
        <div className={styles.logo}>
          <h1>MONKE CASINO</h1>
        </div>

        <div className={styles.loginPanel}>
          <h2>Welcome Back</h2>
          <p className={styles.subTitle}>Please enter your details</p>

          <div className={styles.emailSection}>
            <h3>Email address</h3>
            <input
              type="text"
              className={styles.EmailInput}
              placeholder="yourEmail@domain.com"
            />
          </div>

          <div className={styles.passwordSection}>
            <h3>Password</h3>
            <input
              type="password"
              className={styles.PasswordInput}
              placeholder="••••••••"
            />
          </div>

          <button type="button" className={styles.submitButton}>
            Log In
            <ToastContainer/>
          </button>

          <div className={styles.actions}>
						<p className={styles.signUpPrompt}>
            	<Link to="/forgotPassword" className={styles.forgotLink}>
              	Forgot Password?
            	</Link>
						</p>

            <p className={styles.signUpPrompt}>
              Don’t have an account?{' '}
              <Link to="/register" className={styles.signUpLink}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.rightContainer}></div>
    </div>
  );
}