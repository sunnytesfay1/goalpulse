const express = require("express");
const prisma = require("../prismaClient");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { title, description, goalType, frequency, dueDate } = req.body;

  try {
    const goalData = {
      title,
      description,
      goalType,
      userId: req.user.id,
    };

    if (goalType === "recurring") {
      goalData.frequency = frequency;
    } else {
      goalData.dueDate = new Date(dueDate);
    }

    const goal = await prisma.goal.create({
      data: goalData,
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { title, description, frequency, dueDate, isCompleted } = req.body;
  const goalId = parseInt(req.params.id);

  try {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        title,
        description,
        frequency,
        dueDate: dueDate ? new Date(dueDate) : goal.dueDate,
        isCompleted,
      },
    });
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const goalId = parseInt(req.params.id);

  try {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await prisma.notification.deleteMany({ where: { goalId } });
    await prisma.goal.delete({ where: { id: goalId } });

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/complete", async (req, res) => {
  const goalId = parseInt(req.params.id);

  try {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const updateData = { isCompleted: !goal.isCompleted };

    // If completing the goal, record when it was completed
    if (!goal.isCompleted) {
      updateData.lastCompleted = new Date();
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
