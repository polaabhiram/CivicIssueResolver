import React from "react";

const getColor = (priority) => {
  switch (priority) {
    case "Critical": return "darkred";
    case "High": return "red";
    case "Medium": return "orange";
    default: return "green";
  }
};

const ComplaintTable = ({ data }) => {
  return (
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Sector</th>
          <th>Severity</th>
          <th>Priority</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.text}</td>
            <td>{item.sector}</td>
            <td>{item.severity}</td>
            <td className={`priority-${item.priority.toLowerCase()}`}>
              {item.priority}
            </td>
            <td>
              {item.location
                ? `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}`
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ComplaintTable;