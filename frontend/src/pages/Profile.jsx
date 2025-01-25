import styles from '../styles/Profile.module.css';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/userCard/userCard';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/useAuth'
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const validation = Yup.object().shape({
    nick: Yup.string(),
    first_name: Yup.string(),
    last_name: Yup.string(),
    password: Yup.string(),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .when('password', {
            is: (password) => password && password.trim() !== '',
            then: (schema) => schema.min(7, 'min length is 7'), 
        }),
})

const Profile = () => {
    const navigate = useNavigate();
    const { dataChange } = useAuth();
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({resolver: yupResolver(validation)})

    const handleProfilePictureChange = () => {
        const formData = watch();
        const isFormFilled = Object.values(formData).some((value) => value && value.trim() !== '');

        if(isFormFilled){
            const confirmDiscard = window.confirm('You have unsaved changes. Do you want to discard them?');
            if(!confirmDiscard) return;
        }

        navigate('/casino/profilePicturePicker');
    };

    let { first_name, last_name, nick, lvl } = JSON.parse(localStorage.getItem('user'));

    const handleDataChange = (form) => {
        const filteredData = Object.fromEntries(
        Object.entries(form).filter(([key, value]) => value && value.trim() !== '' && key != 'password_confirmation'));
        dataChange(filteredData);
        reset()
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

                <div className={styles.profilePictureChangeDiv}>
                    <h2> you can also change your profile picture </h2>
                    <button className={styles.profilePictureChangeButton} onClick={handleProfilePictureChange}>
                        Change your profile picture
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Profile;