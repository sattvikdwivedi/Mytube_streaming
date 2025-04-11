// const asyncHandler=(fn)=>async(req,res,next)=>{
// try{
//   await fn(req,res,next);
// }
// catch(error){
// res.status(err.code || 500).json(
//     {
//         success:false,
//         message:err.message
//     }
// )
// }
// }




const asyncHandler = (RequestHandler)=>{
      return (req,res,next)=>{ Promise.resolve(RequestHandler(req,res,next)).catch((err)=>next(err))}}
    
    export {asyncHandler};