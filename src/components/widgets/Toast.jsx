import React from "react";
import { useData } from "../../context/DataContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function Toast() {
  const { toast } = useData();

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} className="toast-icon-success" />,
    error: <AlertCircle size={18} className="toast-icon-error" />,
    warning: <AlertTriangle size={18} className="toast-icon-warning" />,
    info: <Info size={18} className="toast-icon-info" />
  };

  return (
    <div className={`toast-notification toast-${toast.type || "info"} fade-in-up`}>
      {iconMap[toast.type] || iconMap.info}
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}
