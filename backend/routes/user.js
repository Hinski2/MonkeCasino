import express from 'express';
import { createUser, userLogin, userLogout, userLogoutAll, userMe, userUpdate, userDelete, getUsers, getUser, sudoUserUpdate } from '../controllers/user.js';

import { auth, serverAuth } from '../middlewares/auth.js';

const router = express.Router();

// get methods
router.get('/', getUsers)

router.get('/me', auth, userMe);

router.get('/:id', getUser)

// post methods
router.post('/register', createUser);

router.post('/login', userLogin);

router.post('/logout', auth, userLogout);

router.post('/logoutAll', auth, userLogoutAll);

// patch methods
router.patch('/me', auth, userUpdate);

router.patch('/:id', serverAuth, sudoUserUpdate)

// delete methods 
router.delete('/me', auth, userDelete);
export default router;
