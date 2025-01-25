import { Link } from 'react-router-dom';
import styles from '../styles/Login.module.css';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/useAuth'
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';

const validation = Yup.object().shape({
  email: Yup.string().email('It must be a valid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(7, 'min length is 7'),
});

export default function Login() {
  const { loginUser } = useAuth();
  const { register, handleSubmit, formState: { errors }} = useForm({resolver: yupResolver(validation)})
  const handleLogin = (form) => {
    loginUser(form.email, form.password);
  }

  const handleValidationErrors = (errors) => {
    Object.values(errors).forEach((error) => {
      toast.error(error.message); 
    });
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.leftContainer}>
        <div className={styles.logo}>
          <h1>MONKE CASINO</h1>
        </div>

        <div className={styles.parentContainer}>
          <div className={styles.loginPanel}>
            <h2>Welcome Back</h2>
            <p className={styles.subTitle}>Please enter your details</p>

            <form onSubmit={handleSubmit(handleLogin, handleValidationErrors)} className={styles.form}>
              <div className={styles.emailSection}>
                <h3>Email address</h3>
                <input
                  type="text"
                  className={styles.EmailInput}
                  placeholder="yourEmail@domain.com"
                  {...register('email')}
                />
              </div>

              <div className={styles.passwordSection}>
                <h3>Password</h3>
                <input
                  type="password"
                  className={styles.PasswordInput}
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Log In
              </button>
            </form>
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
      </div>
      <div className={styles.rightContainer}></div>
    </div>
  );
}