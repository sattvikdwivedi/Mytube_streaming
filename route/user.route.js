import { Router } from "express";
import { loginUser, logoutUser, PasswordReset, refreshAccessToken, registerUser } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from './../middleware/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:"Avatar",
            maxCount:1
        },
        {
            name:"CoverImage",
            maxCount:1
        }
    ])
    ,registerUser);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJwt,logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/password-reset').post(verifyJwt,PasswordReset);


export default router;