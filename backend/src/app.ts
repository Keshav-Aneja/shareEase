import express from 'express';
import cors from "cors"
import { apiError } from './utils/apiError';
import userRouter from './routes/user.routes';
import expenseRouter from './routes/expense.routes';
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" })); 
app.use(express.static("public")); 

// Routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/expense",expenseRouter)

// Not found handler
app.use((_, res, next) => {
  throw new apiError(404, "Resource not found");
});

// Error Response handler
app.use((err:any, req:any, res:any, next:any) => {
  if(err instanceof apiError) {
    return res.status(err.statusCode).json(err);
  }
  else if(err instanceof Error){
    return res.status(400).json(new apiError(400, err.message)  );
  }
  else{
    return res.status(400).json("Something went wrong");
  }
});



export {app}