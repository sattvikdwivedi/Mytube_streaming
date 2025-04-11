    import  jwt from "jsonwebtoken"
    import { asyncHandler } from "../utils/asyncHandler.js"
    import ApiErrors from "../utils/ApiError.js";
    import { User } from "../models/user.model.js";


    export const verifyJwt= asyncHandler(async(req,res,next)=>{
        
        try {
            const token  =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token) throw new ApiErrors(401,"Unauthorized Request");
        const decodedDetails = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedDetails._id).select('-password -refreshToken');
    
        if(!user) throw new ApiErrors(401,"Invalid Access Token");  
        req.user= user;
        next();   
        
    } catch (error) {
        throw new ApiErrors(401, error.message || "Something  Wrong in Token");
    }

    })