import express from 'express';
import { createUser, userLogin, userLogout, userLogoutAll, userMe, userUpdate, userDelete, getUsers } from '../controllers/user.js';

import { auth } from '../middlewares/auth.js';

const router = express.Router();

<<<<<<< HEAD
// get methods
=======

>>>>>>> 559396227fa9e7b1e047586836a47f45d36f629f
router.get('/', getUsers)

router.get('/me', auth, userMe);

// post methods
router.post('/register', createUser);

router.post('/login', userLogin);

router.post('/logout', auth, userLogout);

router.post('/logoutAll', auth, userLogoutAll);

// patch methods
router.patch('/me', auth, userUpdate);

// delete methods 
router.delete('/me', auth, userDelete);
export default router;
