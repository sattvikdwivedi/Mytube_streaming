import dotenv  from 'dotenv';
import connectDB from "./db/index.js";
dotenv.config({ path:'./env'});
connectDB();
/*
const app =express();
(async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        app.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });
        console.log("Connected to MongoDB successfully!");
        app.listen(process.env.PORT,()=>{
            console.log(`Listen on the ${process.env.PORT}`);
            
        })
    }
    catch(err){
        console.error("Error connecting to MongoDB:", err);
    }
})();

*/