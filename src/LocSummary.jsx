import React, { useContext, useState, useEffect } from "react";
import { Globals } from "../Globals";
const LocSummary = () => {
  const { totals, logs, details } = useContext(Globals);
  const [filTotals, setFilTotals] = useState([]);
  const [filApps, setFilApps] = useState([]);
  //filter locum totals
  useEffect(() => {
    const fTotals = totals.filter((tot) => tot.Locum);
    setFilTotals(fTotals);
  }, [totals]);

  //filter summary for locum
  useEffect(() => {
    const fApps = details.filter((det) => det.Locum);
    setFilApps(fApps);
  }, [totals]);
  // calculate daily locum totals
  const calculateLocumTotals = (totals) => {
    return totals.reduce((acc, total) => {
      const totalDate = new Date(total.Date).toISOString().split("T")[0];
      const key = `${totalDate}-${total.Locum}-${total.MedicalAid}`;

      if (!acc[key]) {
        acc[key] = {
          MedicalAid: total.MedicalAid,
          Amount: 0, // Initialize amount
          Date: totalDate,
          Locum: total.Locum,
        };
      }

      acc[key].Amount += Number(total.Amount); // Sum the amounts
      return acc;
    }, {});
  };
  //view locum totals
  const viewLocum = () => {
    const locumTotals = calculateLocumTotals(filTotals);
    const aggregatedTotals = Object.values(locumTotals);
    return (
      <div className="my-5 lg:my-10">
        <h2 className="flex justify-center text-xl lg:text-2xl my-2 lg:my-4 text-blue-600 font-medium">
          Totals
        </h2>
        {aggregatedTotals.length > 0 ? (
          <>
            <table className="min-w-full text-sm lg:text-base bg-white border border-gray-300 mt-2 lg:mt-4">
              <thead>
                <tr>
                  <th className="border-b lg:p-4 p-1 text-left">Medical Aid</th>
                  <th className="border-b lg:p-4 p-1 text-left">Amount</th>
                  <th className="border-b lg:p-4 p-1 text-left">Date</th>
                  <th className="border-b lg:p-4 p-1 text-left">Doctor</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedTotals
                  .sort((a, b) => new Date(b.Date) - new Date(a.Date))
                  .map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b lg:p-4 p-1">{item.MedicalAid}</td>
                      <td className="border-b lg:p-4 p-1">
                        {item.Amount.toFixed(2)}
                      </td>
                      <td className="border-b lg:p-4 p-1">
                        <span className="text-sm text-gray-500">
                          {String(
                            new Date(item.Date).toISOString().split("T")[0]
                          )}
                        </span>
                      </td>
                      <td className="border-b lg:p-4 p-1">{item.Locum}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-center mt-4 text-red-600">
            No transactions found for locum!
          </p>
        )}
      </div>
    );
  };
  //view locum check ins
  const viewChecks = () => {
    const calculateTimeDifference = (checkin, checkout) => {
      if (!checkin || !checkout) return "--";

      const [checkinHours, checkinMinutes] = checkin.split(":").map(Number);
      const [checkoutHours, checkoutMinutes] = checkout.split(":").map(Number);

      const checkinTotalMinutes = checkinHours * 60 + checkinMinutes;
      const checkoutTotalMinutes = checkoutHours * 60 + checkoutMinutes;
      const difference = checkoutTotalMinutes - checkinTotalMinutes;
      const hours = Math.floor(difference / 60);
      const minutes = difference % 60;

      return `${hours}h ${minutes}m`;
    };

    return (
      <div className="my-5 lg:my-10">
        <h2 className="flex justify-center text-xl lg:text-2xl my-4 text-blue-600 font-medium">
          Checked Times
        </h2>
        {logs.length > 0 ? (
          <>
            <table className="min-w-full text-sm lg:text-base bg-white border border-gray-300 mt-2 lg:mt-4">
              <thead>
                <tr>
                  <th className="border-b lg:p-4 p-1 text-left">Doctor</th>
                  <th className="border-b lg:p-4 p-1 text-left">Date</th>
                  <th className="border-b lg:p-4 p-1 text-left">Check-In</th>
                  <th className="border-b lg:p-4 p-1 text-left">Check-Out</th>
                  <th className="border-b lg:p-4 p-1 text-left">Hours</th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .sort((a, b) => new Date(b.Date) - new Date(a.Date))
                  .map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b p-4">{item.Locum}</td>
                      <td className="border-b p-4">
                        <span className="text-sm text-gray-500">
                          {String(
                            new Date(item.Date).toISOString().split("T")[0]
                          )}
                        </span>
                      </td>
                      <td className="border-b p-4">{item.Checkin}</td>
                      <td className="border-b p-4">{item.Checkout}</td>
                      <td className="border-b p-4">
                        {calculateTimeDifference(item.Checkin, item.Checkout)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-center mt-4 text-red-600">No times yet!</p>
        )}
      </div>
    );
  };
  return (
    <div className="p-2 lg:p-4">
      {viewLocum()}
      {viewChecks()}
    </div>
  );
};

export default LocSummary;
