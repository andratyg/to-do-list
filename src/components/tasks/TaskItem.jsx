import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus,
  CheckSquare,
  Square
} from "lucide-react";

export default function TaskItem({ task, onUpdate, onDelete, onEdit }) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const isCompleted = task.completed;
  const isOverdue =
    task.deadline &&
    !isCompleted &&
    new Date(task.deadline).setHours(23, 59, 59, 999) < new Date().getTime();

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !isCompleted });
  };

  const handleToggleSubtask = (idx) => {
    const subtasks = [...(task.subtasks || [])];
    subtasks[idx].completed = !subtasks[idx].completed;
    onUpdate(task.id, { subtasks });
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const subtasks = [...(task.subtasks || []), { text: newSubtaskText.trim(), completed: false }];
    onUpdate(task.id, { subtasks });
    setNewSubtaskText("");
  };

  const handleDeleteSubtask = (idx) => {
    const subtasks = task.subtasks.filter((_, i) => i !== idx);
    onUpdate(task.id, { subtasks });
  };

  const priorityColor =
    task.priority === "high" || task.priority === "tinggi"
      ? "badge-priority-high"
      : task.priority === "medium" || task.priority === "sedang"
      ? "badge-priority-medium"
      : "badge-priority-low";

  const priorityLabel =
    task.priority === "high" || task.priority === "tinggi"
      ? "Tinggi"
      : task.priority === "medium" || task.priority === "sedang"
      ? "Sedang"
      : "Rendah";

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className={`task-card ${isCompleted ? "task-completed" : ""} ${isOverdue ? "task-overdue" : ""}`}>
      <div className="task-main-row">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className="task-check-btn"
          title={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
        >
          {isCompleted ? (
            <CheckCircle2 className="check-icon-done" size={22} />
          ) : (
            <Circle className="check-icon-idle" size={22} />
          )}
        </button>

        {/* Title & Info */}
        <div className="task-info">
          <div className="task-title-row">
            <h4 className={`task-title ${isCompleted ? "line-through" : ""}`}>
              {task.title}
            </h4>
          </div>

          <div className="task-meta-row">
            {task.deadline && (
              <span className={`meta-item ${isOverdue ? "text-danger" : ""}`}>
                <Calendar size={13} />
                {task.deadline}
                {isOverdue && " (Terlambat!)"}
              </span>
            )}

            {task.category && (
              <span className="meta-item category-tag">
                <Tag size={12} /> {task.category}
              </span>
            )}

            <span className={`meta-badge ${priorityColor}`}>
              {priorityLabel}
            </span>

            {subtasks.length > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="subtasks-toggle-btn"
              >
                <span>{completedSubtasksCount}/{subtasks.length} subtask</span>
                {showSubtasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="btn-icon-subtle" title="Edit Tugas">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(task.id)} className="btn-icon-subtle text-danger" title="Hapus Tugas">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subtasks dropdown */}
      {showSubtasks && (
        <div className="task-subtasks-container">
          <div className="subtasks-list">
            {subtasks.map((st, idx) => (
              <div key={idx} className="subtask-item">
                <button onClick={() => handleToggleSubtask(idx)} className="subtask-check-btn">
                  {st.completed ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                </button>
                <span className={`subtask-text ${st.completed ? "line-through" : ""}`}>
                  {st.text}
                </span>
                <button onClick={() => handleDeleteSubtask(idx)} className="btn-icon-mini text-danger">
                  ×
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="add-subtask-form">
            <input
              type="text"
              placeholder="Tambah langkah subtask..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
            />
            <button type="submit" className="btn-subtask-add">
              <Plus size={14} /> Tambah
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
