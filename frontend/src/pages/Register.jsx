import { Link } from 'react-router-dom';
import styles from '../styles/Register.module.css'
import { useState } from 'react';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/useAuth'
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';

const validation = Yup.object().shape({
    nick: Yup.string().required('Nick is required'),
    first_name: Yup.string().required('Name is required'),
    last_name: Yup.string().required('Surname is required'),
    email: Yup.string().email('It must be a valid email').required('Email is required'),
    password: Yup.string().required('Password is required').min(7, 'Password min length is 7'),
    password_confirmation: Yup.string().required('Password confirmation is required').oneOf([Yup.ref('password'), null], 'Passwords must match'),
    profile_picture: Yup.string().required('You have to pick up profile picture')
});


export default function Register(){
    const [selectedImage, setSelectedImage] = useState(null);
    const images = [
        '/profile_pictures/pp0.webp',
        '/profile_pictures/pp1.webp',
        '/profile_pictures/pp2.webp',
        '/profile_pictures/pp3.webp',
        '/profile_pictures/pp4.webp',
        '/profile_pictures/pp5.webp',
    ];

    const { registerUser } = useAuth();
    const { register, handleSubmit, setValue, formState: { errors }} = useForm({resolver: yupResolver(validation)})
    const handleRegister = (form) => {
        registerUser(form.first_name, form.last_name, form.email, form.nick, form.password, form.profile_picture);
    };
    const handleImageClick = (index) => {
        const imageName = images[index].split('/').pop();
        setSelectedImage(imageName);
        setValue('profile_picture', imageName);
    };

    const handleValidationErrors = (errors) => {
        Object.values(errors).forEach((error) => {
            toast.error(error.message);
        });
    };

    return(
        <div className={styles.mainContainer}>
            <div className={styles.leftContainer}>
            </div>
            <div className={styles.rightContainer}>
                <div className={styles.logo}>
                    <h1> Monke Casino </h1>
                    <h1> Sign Up </h1>
                </div>
                <form onSubmit={handleSubmit(handleRegister, handleValidationErrors)} className={styles.form}>
                    <div className={styles.RegisterPanel}>
                        <div className={styles.row1}>
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
                        </div>
                        <div className={styles.row2}>
                            <div className={styles.nick}>
                                <h3> Nick </h3>
                                <input 
                                    type='text'
                                    className={styles.nickInput}
                                    placeholder='Your nick'
                                    {...register('nick')}
                                />
                            </div>
                            <div className={styles.email}>
                                <h3> Email </h3>
                                <input 
                                    type='text'
                                    className={styles.emailInput}
                                    placeholder='yourEmail@domain.com'
                                    {...register('email')}
                                />
                            </div>
                        </div>
                        <div className={styles.row3}>
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
                        </div>
                    </div>
                    <div className={styles.profilePicturePanel}>
                        <h2> Pick your profile picture </h2>
                        <div className={styles.imageGrid}>
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`${styles.imageContainer} ${selectedImage === image.split('/').pop() ? styles.selected : ''}`}
                                    onClick={() => handleImageClick(index)}
                                >
                                    <img src={image} alt={`Profile ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                        <input 
                            type='hidden'
                            {...register('profile_picture')}
                        />
                    </div>
                    <div className={styles.submitSection}>
                        <button type='submit' className={styles.submitButton}>
                            Sign Up
                        </button>
                        <p className={styles.loginPrompt}>
                            Already have an acout? {' '}
                            <Link to={'/login'} className={styles.loginLink}>
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}