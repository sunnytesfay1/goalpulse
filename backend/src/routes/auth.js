const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/notification-preference", protect, async (req, res) => {
  const { notificationFrequency } = req.body;

  if (!["passive", "persistent"].includes(notificationFrequency)) {
    return res
      .status(400)
      .json({ message: "Invalid frequency. Use passive or persistent." });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { notificationFrequency },
    });

    res.json({
      message: "Notification preference updated",
      notificationFrequency: user.notificationFrequency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Test SMS endpoint
router.post("/test-sms", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const twilio = require("twilio");
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    await twilioClient.messages.create({
      body: `🎯 GoalPulse Test SMS\n\nHey ${user.name}! If you're seeing this, your notifications are working perfectly! 💪`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });

    res.json({ message: "Test SMS sent successfully!" });
  } catch (error) {
    console.error("Test SMS error:", error);
    res
      .status(500)
      .json({ message: "Failed to send test SMS", error: error.message });
  }
});

module.exports = router;
