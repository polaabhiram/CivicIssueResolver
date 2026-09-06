import React, { useState } from "react";
import ComplaintForm from "../components/ComplainForm";
import ComplaintTable from "../components/ComplaintTable";

const CitizenPage = () => {
  const [complaints, setComplaints] = useState([]);

  const handleAddComplaint = (complaint) => {
    setComplaints([complaint, ...complaints]);
  };

  return (
    <div>
      <ComplaintForm onSubmit={handleAddComplaint} />
      <ComplaintTable data={complaints} />
    </div>
  );
};

export default CitizenPage;