import fs from 'fs';
import { get } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
    get profile pictures with level less than or equal to the given level
    @param {number} lvl - level
    @returns {Promise<Array<Object>>} - Array of profile picture objects
*/
const getProfilePicturesLEQLvl = async (lvl) => {
    const directoryPath = path.join(__dirname, '..', '..','public', 'profile_pictures');

    try {
        // Read files in the directory
        const files = await fs.promises.readdir(directoryPath);

        // Filter files based on the level
        const filteredFiles = files.filter(file => {
            const level = parseInt(file.split('_')[1], 10); 
            return !isNaN(level) && level <= lvl;
        });

        // Map filtered files to objects with file details
        const profilePictures = filteredFiles.map(file => ({
            fileName: file,
            filePath: path.join(directoryPath, file),
        }));

        return profilePictures;
    } catch (err) {
        console.error('Unable to scan directory:', err);
        throw err;
    }
};

/*
    get all profile pictures
    @returns {Promise<Array<Object>>} - Array of profile picture objects
*/
const getAllProfilePictures = async () => {
    const directoryPath = path.join(__dirname, '..', '..','public', 'profile_pictures');

    try {
        // Read files in the directory
        const files = await fs.promises.readdir(directoryPath);

        // Map files to objects with file details
        const profilePictures = files.map(file => ({
            lvl: parseInt(file.split('_')[1], 10),
            fileName: file,
            filePath: path.join(directoryPath, file),
        }));

        return profilePictures;
    } catch (err) {
        console.error('Unable to scan directory:', err);
        throw err;
    }
};

export { getProfilePicturesLEQLvl, getAllProfilePictures };