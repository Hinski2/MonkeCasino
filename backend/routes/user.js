import express from 'express';
import { createUser, userLogin, userLogout, userLogoutAll, userMe, userUpdate, userDelete, getUsers } from '../controllers/user.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getUsers)

router.post('/register', createUser);

router.post('/login', userLogin);

router.post('/logout', auth, userLogout);

router.post('/logoutAll', auth, userLogoutAll);

router.get('/me', auth, userMe);

router.patch('/me', auth, userUpdate);

router.delete('/me', auth, userDelete);
export default router;
