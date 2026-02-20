"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config/api";

export default function Settings() {
  const { user, token, logout, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notificationFrequency, setNotificationFrequency] = useState("passive");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setNotificationFrequency(user.notificationFrequency || "passive");
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/notification-preference`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationFrequency }),
      });

      if (res.ok) {
        updateUser({ notificationFrequency });
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings");
      }
    } catch (error) {
      setMessage("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMS = async () => {
    setTestLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/test-sms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Test SMS sent! Check your phone.");
      } else {
        setMessage(`Failed to send SMS: ${data.message}`);
      }
    } catch (error) {
      setMessage("Error sending test SMS");
    } finally {
      setTestLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <>
      {/* Navigation */}
      <nav className="nav">
        <div
          className="logo"
          onClick={() => router.push("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-icon gradient-bg">
            <span>G</span>
          </div>
          <span className="font-bold" style={{ fontSize: "18px" }}>
            GoalPulse
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="nav-button"
          >
            Dashboard
          </button>
          <button onClick={logout} className="nav-button">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-container">
        <h1
          style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}
        >
          Settings
        </h1>
        <p className="text-muted mb-6">
          Manage your account and notification preferences
        </p>

        <div className="card" style={{ maxWidth: "600px" }}>
          <h2 className="font-semibold mb-4" style={{ fontSize: "20px" }}>
            Account Information
          </h2>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="input-field"
              value={user.name}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={user.email}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              value={user.phone}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          <div className="divider"></div>

          <h2 className="font-semibold mb-4" style={{ fontSize: "20px" }}>
            Notification Preferences
          </h2>

          <div className="form-group">
            <label className="form-label">Reminder Frequency</label>
            <select
              className="input-field"
              value={notificationFrequency}
              onChange={(e) => setNotificationFrequency(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="passive">
                Passive - One gentle reminder at 6 PM
              </option>
              <option value="persistent">
                Persistent - Reminders at 9 AM, 12 PM, 3 PM, 6 PM
              </option>
            </select>
          </div>

          <div
            style={{
              background: "rgba(74, 222, 128, 0.05)",
              border: "1px solid rgba(74, 222, 128, 0.15)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "24px",
            }}
          >
            <p
              className="text-sm"
              style={{ color: "#86efac", lineHeight: "1.5" }}
            >
              💡 All users receive a morning briefing at 8 AM with their goals
              for the day. Choose your reminder style for follow-ups throughout
              the day.
            </p>
          </div>

          {message && (
            <div
              className={
                message.includes("success")
                  ? "success-message"
                  : "error-message"
              }
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={loading}
            style={{ width: "auto", padding: "12px 32px" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={handleTestSMS}
            className="btn-secondary"
            disabled={testLoading}
            style={{ width: "auto", padding: "12px 32px", marginLeft: "12px" }}
          >
            {testLoading ? "Sending..." : "📱 Send Test SMS"}
          </button>
        </div>
      </div>
    </>
  );
}
