import express from "express"
import bodyParser from "body-parser"
import { InfoController } from "./controllers/InfoController"
import { AuthController } from "./controllers/AuthController"
import { UserController } from "./controllers/UserController"
import { FaucetController } from "./controllers/FaucetController"
import { AccountDeletionController } from "./controllers/AccountDeletionController"

const app = express()

// Alternatively, you could add custom middleware to set headers and handle OPTIONS:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Expose-Headers', '*')
  res.header('Access-Control-Allow-Private-Network', 'true')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(bodyParser.json())

// Info route
app.get("/info", InfoController.getInfo)

// Auth routes
app.post("/auth/start", AuthController.startAuth)
app.post("/auth/complete", AuthController.completeAuth)

// Account deletion routes (for users who can't access their account)
app.post("/account/delete/start", AccountDeletionController.startDeletion)
app.post("/account/delete/complete", AccountDeletionController.completeDeletion)

// User routes
app.post("/user/linkedMethods", UserController.listLinkedMethods)
app.post("/user/unlinkMethod", UserController.unlinkMethod)
app.post("/user/delete", UserController.deleteUser)

// Faucet route
app.post("/faucet/request", FaucetController.requestFaucet)

export default app
