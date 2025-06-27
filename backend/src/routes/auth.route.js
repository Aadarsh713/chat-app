import express from 'express';
import { signup,login,logout , updateProfile ,checkAuth } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)

// for updating profile and sending a message user has to be logged in, he should be authenticated thats why we are using protectRoute middleware
router.put('/update-profile', protectRoute, updateProfile)

router.get("/check",protectRoute,checkAuth)


export default router;