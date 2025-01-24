import styles from '../styles/ProfilePicturePicker.module.css';
import { useState, useEffect } from 'react';
import { getAllProfilePictures } from '../utils/getProfilePictures';

const ProfilePicturePicker = () => {
    const [pictures, setPictures] = useState([]); 

    useEffect(() => {
        const fetchPictures = async () => {
            try {
                const data = await getAllProfilePictures(); 
                console.log('Fetched pictures:', data); 
                setPictures(data); 
            } catch (error) {
                console.error('Error fetching profile pictures:', error);
            }
        };

        fetchPictures();
    }, []); 

    return (
        <div className={styles.mainContainer}>
            <div className={styles.navbar}>
            </div>

            <form>
                <div className={styles.gallery}>
                    
                </div>
            </form>
        </div>
    );
};

export default ProfilePicturePicker;