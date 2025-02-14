/**
 * app.ts
 *
 * Configures the Express app, routes, etc.
 */
import express from "express";
import bodyParser from "body-parser";
import { InfoController } from "./controllers/InfoController";
import { AuthController } from "./controllers/AuthController";
import { UserController } from "./controllers/UserController";
import { FaucetController } from "./controllers/FaucetController";

const app = express();
app.use(bodyParser.json());

// Info route
app.get("/info", InfoController.getInfo);

// Auth routes
app.post("/auth/start", AuthController.startAuth);
app.post("/auth/complete", AuthController.completeAuth);

// User routes
app.post("/user/linkedMethods", UserController.listLinkedMethods);
app.post("/user/unlinkMethod", UserController.unlinkMethod);
app.post("/user/delete", UserController.deleteUser);

// Faucet route
app.post("/faucet/request", FaucetController.requestFaucet);

export default app;
