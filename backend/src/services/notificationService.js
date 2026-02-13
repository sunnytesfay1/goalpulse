const cron = require("node-cron");
const twilio = require("twilio");
const prisma = require("../prismaClient");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const sendReminderSMS = async (userPhone, userName, goals) => {
  const goalsList = goals.map((g) => `• ${g.title}`).join("\n");

  const message =
    goals.length === 1
      ? `Hey ${userName}! Just a reminder about your goal:\n\n${goalsList}\n\nMark it complete in GoalPulse!`
      : `Hey ${userName}! You have ${goals.length} goals to complete:\n\n${goalsList}\n\nMark them complete in GoalPulse!`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone,
    });
    console.log(`SMS sent to ${userPhone}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${userPhone}:`, error.message);
  }
};

const sendMorningBriefing = async (user, goals) => {
  const goalsList = goals
    .map((g) => `• ${g.title} (${g.frequency})`)
    .join("\n");

  const message = `☀️ Good morning ${user.name}! Here's what you have today:\n\n${goalsList}\n\nYou've got this! 💪`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });
    console.log(`Morning briefing sent to ${user.phone}`);
  } catch (error) {
    console.error(
      `Failed to send morning briefing to ${user.phone}:`,
      error.message,
    );
  }
};

const getUsersWithIncompleteGoals = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.user.findMany({
    where: {
      goals: {
        some: {
          isCompleted: false,
          dueDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
    },
    include: {
      goals: {
        where: {
          isCompleted: false,
          dueDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
    },
  });
};

const scheduleMorningBriefing = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running morning briefing...");
    const users = await getUsersWithIncompleteGoals();

    for (const user of users) {
      if (user.goals.length > 0) {
        await sendMorningBriefing(user, user.goals);
      }
    }
  });
};

const schedulePassiveReminders = () => {
  cron.schedule("0 18 * * *", async () => {
    console.log("Running passive reminders...");
    const users = await getUsersWithIncompleteGoals();

    for (const user of users) {
      if (user.notificationFrequency === "passive" && user.goals.length > 0) {
        await sendReminderSMS(user.phone, user.name, user.goals);
      }
    }
  });
};

const schedulePersistentReminders = () => {
  cron.schedule("0 9,12,15,18 * * *", async () => {
    console.log("Running persistent reminders...");
    const users = await getUsersWithIncompleteGoals();

    for (const user of users) {
      if (
        user.notificationFrequency === "persistent" &&
        user.goals.length > 0
      ) {
        await sendReminderSMS(user.phone, user.name, user.goals);
      }
    }
  });
};

const resetRecurringGoals = async () => {
  const now = new Date();

  try {
    // Get all recurring goals that were completed
    const recurringGoals = await prisma.goal.findMany({
      where: {
        goalType: "recurring",
        isCompleted: true,
        lastCompleted: { not: null },
      },
    });

    for (const goal of recurringGoals) {
      let shouldReset = false;
      const lastCompleted = new Date(goal.lastCompleted);

      if (goal.frequency === "daily") {
        // Reset if last completed yesterday or earlier
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);
        shouldReset = lastCompleted <= yesterday;
      } else if (goal.frequency === "weekly") {
        // Reset if it's Monday and last completed was before this week
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
        if (dayOfWeek === 1) {
          const startOfWeek = new Date(now);
          startOfWeek.setHours(0, 0, 0, 0);
          shouldReset = lastCompleted < startOfWeek;
        }
      } else if (goal.frequency === "monthly") {
        // Reset if it's the 1st of the month and last completed was last month
        if (now.getDate() === 1) {
          const startOfMonth = new Date(now);
          startOfMonth.setHours(0, 0, 0, 0);
          shouldReset = lastCompleted < startOfMonth;
        }
      }

      if (shouldReset) {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { isCompleted: false },
        });
        console.log(`Reset recurring goal: ${goal.title}`);
      }
    }
  } catch (error) {
    console.error("Error resetting recurring goals:", error);
  }
};

const scheduleRecurringReset = () => {
  // Run at midnight every day
  cron.schedule("0 0 * * *", async () => {
    console.log("Checking recurring goals for reset...");
    await resetRecurringGoals();
  });
};

const startNotificationService = () => {
  console.log("Notification service started");
  console.log("  ☀️  Morning briefing scheduled for 8:00 AM daily");
  console.log("  💤 Passive reminders scheduled for 6:00 PM daily");
  console.log(
    "  🔔 Persistent reminders scheduled for 9AM, 12PM, 3PM, 6PM daily",
  );
  console.log("  🔄 Recurring goals reset at midnight daily");

  scheduleMorningBriefing();
  schedulePassiveReminders();
  schedulePersistentReminders();
  scheduleRecurringReset();
};

module.exports = { startNotificationService };
