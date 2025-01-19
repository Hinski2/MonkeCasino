import styles from '../styles/Profile.module.css';
import UserCard from '../components/userCard/userCard';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/useAuth'
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const validation = Yup.object().shape({
     nick: Yup.string().required('Nick is required'),
    first_name: Yup.string().required('Name is required'),
    last_name: Yup.string().required('Surname is required'),
    password: Yup.string().required('Password is required').min(7, 'Password min length is 7'),
    password_confirmation: Yup.string().required('Password confirmation is required').oneOf([Yup.ref('password'), null], 'Passwords must match'),
})

const Profile = () => {
    let { first_name, last_name, nick, lvl } = JSON.parse(localStorage.getItem('user'));

    const { dataChange } = useAuth();
    const { register, handleSubmit, formState: {errors}} = useForm({resolver: yupResolver(validation)})
    const handleDataChange = (form) => {
        dataChange(form.first_name, form.last_name, form.nick, form.password);
    }

    const handleValidationErrors = (errors) => {
        Object.values(errors).forEach((error) => {
            toast.error(error.message);
        });
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftContainer}>
                <UserCard />
            </div>
            <div className={styles.rightContainer}>
                <h1>{nick}'s Profile</h1>
                <div className={styles.data}>
                    <h2>First Name: {first_name}</h2>
                    <h2>Last Name: {last_name}</h2>
                    <h2>Nick: {nick}</h2>
                    <h2>Lvl: {lvl}</h2>
                </div>

                <form onSubmit={handleSubmit(handleDataChange, handleValidationErrors)}>
                    <div className={styles.dataChange}>
                        <h2> change your data </h2>
                        <div className={styles.firstName}>
                            <h3> First Name </h3>
                            <input 
                                type='text'
                                className={styles.firstNameInput}
                                placeholder='Your name'
                                {...register('first_name')}
                            />
                        </div>
                        <div className={styles.lastName}>
                            <h3> Last Name </h3>
                            <input 
                                type='text'
                                className={styles.lastNameInput}
                                placeholder='Your surname'
                                {...register('last_name')}
                            />
                        </div>
                        <div className={styles.nick}>
                            <h3> Nick </h3>
                            <input 
                                type='text'
                                className={styles.nickInput}
                                placeholder='Your nick'
                                {...register('nick')}
                            />
                        </div>
                        <div className={styles.password1}>
                            <h3> Password </h3>
                            <input 
                                type='password'
                                className={styles.password1Input}
                                placeholder='••••••••'
                                {...register('password')}
                            />
                        </div>
                        <div className={styles.password2}>
                            <h3> Confirm Password </h3>
                            <input 
                                type='password'
                                className={styles.password2Input}
                                placeholder='••••••••'
                                {...register('password_confirmation')}
                            />
                        </div>
                        <div className={styles.submitSection}>
                            <div className={styles.leftButtonDiv}>
                                <button type='submit' className={styles.submitButton}>
                                    Change your data
                                </button>
                            </div>
                            <div className={styles.rightButtonDiv}>
                                <Link to='/casino'>
                                    <button className={styles.discardButton}>
                                        Discard changes
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;