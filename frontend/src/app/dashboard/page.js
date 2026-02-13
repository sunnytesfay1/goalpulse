"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalType: "recurring",
    frequency: "daily",
    dueDate: "",
  });

  // Redirect if not logged in (wait for loading to finish first)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch goals on mount
  useEffect(() => {
    if (token) {
      fetchGoals();
    }
  }, [token]);

  const fetchGoals = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/goals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    const dataToSend = {
      title: formData.title,
      description: formData.description,
      goalType: formData.goalType,
    };

    if (formData.goalType === "recurring") {
      dataToSend.frequency = formData.frequency;
    } else {
      if (!formData.dueDate) {
        alert("Please select a due date for one-time goals");
        return;
      }
      dataToSend.dueDate = formData.dueDate;
    }

    try {
      const res = await fetch("http://localhost:8080/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          goalType: "recurring",
          frequency: "daily",
          dueDate: "",
        });
        await fetchGoals();
      } else {
        alert("Failed to create goal");
      }
    } catch (error) {
      console.error("Failed to create goal:", error);
      alert("Error creating goal");
    }
  };

  const toggleComplete = async (goalId) => {
    if (actionLoading) return;

    setActionLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/goals/${goalId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error("Failed to toggle goal:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/goals/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setDeleteConfirm(null);
        await fetchGoals();
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
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
            onClick={() => router.push("/settings")}
            className="nav-button"
          >
            Settings
          </button>
          <button onClick={handleLogout} className="nav-button">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-container">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                marginBottom: "4px",
              }}
            >
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted">Track your goals and stay consistent</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ width: "auto", padding: "12px 24px" }}
          >
            + New Goal
          </button>
        </div>

        {loading ? (
          <p className="text-muted">Loading your goals...</p>
        ) : goals.length === 0 ? (
          <div className="card text-center" style={{ padding: "60px 40px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              No goals yet
            </h2>
            <p className="text-muted mb-4">
              Create your first goal to get started!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
              style={{ width: "auto", margin: "0 auto", padding: "12px 32px" }}
            >
              Create Goal
            </button>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`goal-card ${goal.isCompleted ? "completed" : ""}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`badge ${goal.goalType === "recurring" ? `badge-${goal.frequency}` : "badge-weekly"}`}
                  >
                    {goal.goalType === "recurring"
                      ? goal.frequency
                      : "one-time"}
                  </span>
                  <button
                    onClick={() => setDeleteConfirm(goal.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    ×
                  </button>
                </div>

                <h3
                  className="font-semibold mb-1"
                  style={{
                    fontSize: "16px",
                    textDecoration: goal.isCompleted ? "line-through" : "none",
                  }}
                >
                  {goal.title}
                </h3>

                <p
                  className="text-sm text-muted mb-3"
                  style={{ minHeight: "20px" }}
                >
                  {goal.description || "\u00A0"}
                </p>

                {/* Always show this line to keep spacing consistent */}
                <p
                  className="text-xs text-muted mb-3"
                  style={{ minHeight: "16px" }}
                >
                  {goal.goalType === "one-time" && goal.dueDate
                    ? `Due: ${new Date(goal.dueDate).toLocaleDateString()}`
                    : "\u00A0"}
                </p>

                <button
                  onClick={() => toggleComplete(goal.id)}
                  disabled={actionLoading}
                  className={goal.isCompleted ? "btn-secondary" : "btn-primary"}
                  style={{
                    fontSize: "14px",
                    padding: "10px 20px",
                    pointerEvents: actionLoading ? "none" : "auto",
                  }}
                >
                  {actionLoading
                    ? "..."
                    : goal.isCompleted
                      ? "✓ Completed"
                      : "Mark Complete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "24px",
              }}
            >
              Create New Goal
            </h2>

            <form onSubmit={handleCreateGoal}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Go to the gym"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add details..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Goal Type</label>
                <select
                  className="input-field"
                  value={formData.goalType}
                  onChange={(e) =>
                    setFormData({ ...formData, goalType: e.target.value })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <option value="recurring">
                    Recurring (resets automatically)
                  </option>
                  <option value="one-time">One-time (specific deadline)</option>
                </select>
              </div>

              {formData.goalType === "recurring" ? (
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    className="input-field"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <option value="daily">Daily (resets every day)</option>
                    <option value="weekly">Weekly (resets every Monday)</option>
                    <option value="monthly">Monthly (resets on the 1st)</option>
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: "",
                      description: "",
                      goalType: "recurring",
                      frequency: "daily",
                      dueDate: "",
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              Delete Goal?
            </h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete this goal? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteGoal(deleteConfirm)}
                className="btn-primary"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
