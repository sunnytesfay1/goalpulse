const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const goalRoutes = require('./routes/goals')
const { startNotificationService } = require('./services/notificationService')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/goals', goalRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'GoalPulse API is running!' })
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  startNotificationService()
})