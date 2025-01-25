/*
    get profile pictures with level less than or equal to the given level
    @param {number} lvl - level
    @returns {Promise<Array<Object>>} - Array of profile picture objects
*/
const getProfilePicturesLEQLvl = async (lvl) => {
    try {
        const response = await fetch('/profile_pictures.json');
        if (!response.ok) {
            throw new Error('Failed to fetch profile pictures');
        }

        const data = await response.json();
        return data.filter(picture => picture.lvl <= lvl); 
    } catch (err) {
        console.error('Error fetching profile pictures:', err);
        throw err;
    }
};

/*
    get all profile pictures
    @returns {Promise<Array<Object>>} - Array of profile picture objects
*/
const getAllProfilePictures = async () => {
     try {
        const response = await fetch('/profile_pictures.json');
        if (!response.ok) {
            throw new Error('Failed to fetch profile pictures');
        }

        return await response.json(); // Zwróć wszystkie zdjęcia
    } catch (err) {
        console.error('Error fetching profile pictures:', err);
        throw err;
    }
};

export { getProfilePicturesLEQLvl, getAllProfilePictures };