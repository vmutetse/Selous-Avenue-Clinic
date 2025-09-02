import React, { useContext, useEffect, useState } from "react";
import { Globals } from "../Globals";

const Summary = () => {
  const { details, medicalAids } = useContext(Globals);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredAppointments = details.filter((item) => {
    const itemDate = new Date(item.Date);
    return (
      (!startDate || itemDate >= new Date(startDate)) &&
      (!endDate || itemDate <= new Date(endDate))
    );
  });

  const getMedicalCounts = () => {
    const counts = {};
    if (!medicalAids || !Array.isArray(medicalAids)) {
      console.error("medicalAids is undefined or not an array");
      return [];
    }

    // Extract the Medical values into an array
    const medicalList = medicalAids.map((aid) => aid.Medical);

    // Loop through filtered appointments and count medical aids
    filteredAppointments.forEach((item) => {
      if (medicalList.includes(item.MedicalAid)) {
        counts[item.MedicalAid] = (counts[item.MedicalAid] || 0) + 1;
      }
    });

    // Convert counts object to an array of objects
    return Object.entries(counts).map(([medical, count]) => ({
      medical,
      count,
    }));
  };
  const medicalCounts = getMedicalCounts();

  // Calculate total counts
  const totalCounts = medicalCounts.reduce(
    (total, item) => total + item.count,
    0
  );
  return (
    <div className="p-1 lg:p-3">
      <h2 className="lg:text-2xl text-lg font-semibold my-2 text-center text-blue-600">
        Summary
      </h2>

      <div className="block mb-2 lg:mb-4">
        <label className="block lg:font-medium mb-2">
          Start Date
          <input
            type="date"
            id="startDate"
            value={startDate}
            className="border border-gray-300 rounded-lg p-1 lg:p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label className="block lg:font-medium mb-2">
          End Date
          <input
            type="date"
            id="endDate"
            value={endDate}
            className="border border-gray-300 rounded-lg p-1 lg:p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {/* Display counts in a table */}
      {medicalCounts.length > 0 ? (
        <>
          <table className="min-w-full bg-white text-sm lg:text-base border border-gray-300 mt-2 lg:mt-4">
            <thead>
              <tr>
                <th className="border-b lg:p-4 p-1 text-left">Medical Aid</th>
                <th className="border-b lg:p-4 p-1 text-left">Patients</th>
              </tr>
            </thead>
            <tbody>
              {medicalCounts.map((item, index) => (
                <tr key={index}>
                  <td className="border-b lg:p-4 p-1">{item.medical}</td>
                  <td className="border-b lg:p-4 p-1">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Display total counts */}
          <div className="text-center text-lg mt-2">
            <strong>Total Number of Patients: </strong>
            {totalCounts}
          </div>
        </>
      ) : (
        <p className="text-center mt-4">
          No patients found for the selected date range.
        </p>
      )}
    </div>
  );
};

export default Summary;
