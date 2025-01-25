import styles from '../styles/ProfilePicturePicker.module.css';
import { useState, useEffect } from 'react';
import { getAllProfilePictures, getProfilePicturesLEQLvl } from '../utils/getProfilePictures';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ProfilePicturePicker = () => {
    const [pictures, setPictures] = useState([]); 
    const [selectedImage, setSelectedImage] = useState(null); 
    const { dataChange } = useAuth();
    const { lvl } = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchPictures = async () => {
            try {
                const data = await getProfilePicturesLEQLvl(lvl); 
                setPictures(data); 
            } catch (error) {
                console.error('Error fetching profile pictures:', error);
            }
        };

        fetchPictures();
    }, []);

    const handleImageClick = (fileName) => {
        setSelectedImage(fileName);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if(selectedImage){
            console.log({'profilePicture': selectedImage});
            dataChange({'profilePicture': selectedImage});
        } else {
            toast.warn('first you have to pick image');
        }
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.navbar}>
                <div className={styles.navContent}>
                    <h1 className={styles.title}>Change Your Profile Picture</h1>
                    <div className={styles.navButtons}>
                        <button
                            type="button"
                            className={styles.submitButton}
                            onClick={handleSubmit}
                        >
                            Change Picture
                        </button>
                        <Link to="/casino">
                            <button type="button" className={styles.discardButton}>
                                Discard Changes
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}> 
                <div className={styles.gallery}>
                    {pictures.map((picture, index) => (
                        <div 
                            key={index} 
                            className={`${styles.imageContainer} ${selectedImage === picture.fileName ? styles.selected : ''}`}
                            onClick={() => handleImageClick(picture.fileName)}
                        >
                            <img 
                                src={`/profile_pictures/${picture.fileName}`}
                                alt={`profile ${index + 1}`}
                                className={styles.image}
                            />
                            <span className={styles.lvl}> Lvl: {picture.lvl} </span>
                        </div>
                    ))}
                </div>
            </form>
        </div>
    );
};

export default ProfilePicturePicker;