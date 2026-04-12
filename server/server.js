import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./configs/db.js"
import { inngest, functions } from "./inngest/index.js"
import { serve } from "inngest/express"
import { clerkMiddleware } from '@clerk/express'
import userRouter from "./routes/userRoutes.js"
import postRouter from "./routes/postRoutes.js"
import storyRouter from "./routes/storyRouter.js"
import messageRouter from "./routes/messageRoutes.js"

const app = express()
const pkg = { serve }

await connectDB()
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}))
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; worker-src 'self' blob:; object-src 'self';")
    next()
})
app.use(clerkMiddleware())
app.get("/", (req, res) => res.send("Server is running"))
app.use("/api/inngest", serve({ client: inngest, functions }))
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/story", storyRouter)
app.use("/api/message", messageRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))