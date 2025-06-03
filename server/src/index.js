import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import express from "express";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with absolute path
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Verify OpenAI API key is loaded
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

import connectDB from "./db/index.js";
import { app } from "./app.js";

// Deployment setup
const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, "client/dist")));
app.get('*', (_, res) => {
  res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Running server successfully at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!", err);
  });
