import React from "react";
import ComplaintTable from "../components/ComplaintTable";

const GlobalDashboard = ({ data }) => {
  const priorityOrder = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
  };
  const sorted = [...data].sort(
  (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
);

  return (
    <div>
      <h2>Global Dashboard</h2>
      <ComplaintTable data={sorted} />
    </div>
  );
};

export default GlobalDashboard;