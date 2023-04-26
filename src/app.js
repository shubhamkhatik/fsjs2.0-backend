import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import allRoute from "./routes/route.index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use("/api", allRoute);
app.get("/", (_req, res) => {
  res.send("please add /api on routes");
});

app.all("*", (_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found, contact admin",
  });
});

export default app;
