import React, { useContext, useEffect, useState } from "react";
import { Globals } from "../Globals";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  addDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Totals = () => {
  const { medicalAids, totals, doctors, logs } = useContext(Globals);
  const [searchDate, setSearchDate] = useState("");
  const [view, setView] = useState("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [addTotal, setAddTotal] = useState(false);
  const [openAll, setOpenAll] = useState(false);
  const [subD, setSubD] = useState(() => {
    const substitute = localStorage.getItem("subD");
    return substitute || "";
  });
  const [received, setReceived] = useState([]);
  const [trendData, setTrendData] = useState({});
  const [cIn, setCIn] = useState("");
  const [cOut, setCOut] = useState("");

  // Fetch data for analysis
  const fetchDataForAnalysis = async () => {
    const totalsData = await getDocs(collection(db, "Totals"));
    const totals = totalsData.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return totals;
  };
  // Analyze trends
  const analyzeTrends = (totals) => {
    const trendData = totals.reduce((acc, item) => {
      acc[item.MedicalAid] = (acc[item.MedicalAid] || 0) + Number(item.Amount);
      return acc;
    }, {});

    return trendData;
  };
  // Analyze weekly trends
  const analyzeWeeklyTrends = (totals) => {
    const weeklyData = {};
    totals.forEach((item) => {
      const date = new Date(item.Date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        .toISOString()
        .split("T")[0]; // Get the start of the week
      const medicalAid = item.MedicalAid;
      const amount = Number(item.Amount);

      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = {};
      }
      weeklyData[weekStart][medicalAid] =
        (weeklyData[weekStart][medicalAid] || 0) + amount;
    });
    return weeklyData;
  };
  // Analyze monthly trends
  const analyzeMonthlyTrends = (totals) => {
    const monthlyData = {};
    totals.forEach((item) => {
      const date = new Date(item.Date);
      const monthYear = date.toISOString().split("T")[0].slice(0, 7); // Get the month and year (YYYY-MM)
      const medicalAid = item.MedicalAid;
      const amount = Number(item.Amount);

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {};
      }
      monthlyData[monthYear][medicalAid] =
        (monthlyData[monthYear][medicalAid] || 0) + amount;
    });
    return monthlyData;
  };
  //Handle analysis
  const handleAnalyzeTrends = async () => {
    const totals = await fetchDataForAnalysis();
    let trends;

    if (view === "weekly") {
      trends = analyzeWeeklyTrends(totals);
    } else if (view === "monthly") {
      trends = analyzeMonthlyTrends(totals);
    } else {
      trends = analyzeTrends(totals); // For daily or other analyses
    }

    setTrendData(trends);
  };
  // Chart data preparation
  const prepareChartData = () => {
    const labels = Object.keys(trendData);
    const datasets = [];

    Object.entries(trendData).forEach(([timePeriod, medicalAids]) => {
      Object.entries(medicalAids).forEach(([medicalAid, amount]) => {
        const dataset = datasets.find((d) => d.label === medicalAid);
        if (dataset) {
          dataset.data.push(amount);
        } else {
          datasets.push({
            label: medicalAid,
            data: [amount],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          });
        }
      });
    });

    return {
      labels: labels,
      datasets: datasets,
    };
  };
  //call analysis on mount
  useEffect(() => {
    handleAnalyzeTrends();
  }, [view]);

  //save check times to db
  const handleSaveLog = async () => {
    try {
      const dateKey = new Date().toISOString().split("T")[0];

      // Check if a log for today exists
      const existingLog = logs.find((log) => log.Date === dateKey);

      if (existingLog) {
        const logDocRef = doc(db, "Logs", existingLog.id);
        await updateDoc(logDocRef, {
          Checkout: cOut,
        });
      } else {
        // Create a new log
        const newLog = {
          Checkin: cIn,
          Checkout: cOut,
          Locum: subD,
          Date: dateKey,
        };
        await addDoc(collection(db, "Logs"), newLog);
      }
    } catch (error) {
      console.error("Error logging times: ", error);
    } finally {
      setCIn("");
      setCOut("");
    }
  };
  //save state of locum to local storage
  useEffect(() => {
    localStorage.setItem("subD", subD);
  }, [subD]);
  // Handle input changes
  const handleInputChange = (id, value) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  //handle next and previous buttons
  const changeDate = (amount) => {
    const baseDate = searchDate ? new Date(searchDate) : new Date(currentDate);
    const newDate = new Date(baseDate);

    if (view === "daily") {
      newDate.setDate(newDate.getDate() + amount);
    } else if (view === "weekly") {
      newDate.setDate(newDate.getDate() + amount * 7);
    } else if (view === "monthly") {
      newDate.setMonth(newDate.getMonth() + amount);
    }

    setCurrentDate(newDate);
    setSearchDate("");
  };

  // Rendering logic
  const renderCalendar = () => {
    if (view === "daily") {
      return renderDailyView(currentDate);
    } else if (view === "weekly") {
      return renderWeeklyView(currentDate);
    } else {
      return renderMonthlyView(currentDate);
    }
  };
  //delete transaction
  const deleteTransaction = async (identity) => {
    await deleteDoc(doc(db, "Totals", identity));
  };
  // Filtered totals based on the searchDate
  const filteredTotals = totals.filter((item) => {
    const itemDate = new Date(item.Date);
    return (
      !searchDate ||
      itemDate.toISOString().split("T")[0] ===
        new Date(searchDate).toISOString().split("T")[0]
    );
  });

  //open all daily transactions
  const viewAll = () => {
    const selectedDate = currentDate.toISOString().split("T")[0];
    const filteredTotals1 = filteredTotals.filter((item) => {
      const itemDate = new Date(item.Date);
      return itemDate.toISOString().split("T")[0] === selectedDate;
    });
    return (
      <div>
        {filteredTotals1.length > 0 ? (
          <>
            <table className="min-w-full text-sm lg:text-base bg-white border border-gray-300 mt-4">
              <thead>
                <tr>
                  <th className="border-b p-4 text-left">Medical Aid</th>
                  <th className="border-b p-4 text-left">Amount</th>
                  <th className="border-b p-4 text-left">Time</th>
                  <th className="border-b p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTotals1
                  .sort((a, b) => new Date(b.Date) - new Date(a.Date))
                  .map((item, index) => (
                    <tr key={index}>
                      <td className="border-b p-4">{item.MedicalAid}</td>
                      <td className="border-b p-4">{item.Amount}</td>
                      <td className="border-b p-4">
                        <span className="text-sm text-gray-500">
                          {String(new Date(item.Date).getUTCHours()).padStart(
                            2,
                            "0"
                          )}
                          :
                          {String(new Date(item.Date).getUTCMinutes()).padStart(
                            2,
                            "0"
                          )}
                          :
                          {String(new Date(item.Date).getUTCSeconds()).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </td>
                      <td className="border-b p-4">
                        <button
                          onClick={() => deleteTransaction(item.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-center mt-4">No transactions found for today!</p>
        )}
      </div>
    );
  };
  // Daily view
  const renderDailyView = (date) => {
    const selectedDate = date.toISOString().split("T")[0];

    const dailyTotals = filteredTotals.reduce((acc, total) => {
      const totalDate = new Date(total.Date).toISOString().split("T")[0];
      if (
        totalDate ===
        (searchDate
          ? new Date(searchDate).toISOString().split("T")[0]
          : selectedDate)
      ) {
        const amount = Number(total.Amount); // Convert to number
        acc[total.MedicalAid] = (acc[total.MedicalAid] || 0) + amount;
      }
      return acc;
    }, {});

    return (
      <div>
        <h4 className="lg:text-lg font-semibold">
          Daily Totals for{" "}
          {searchDate
            ? new Date(searchDate).toISOString().split("T")[0]
            : selectedDate}
        </h4>
        {Object.keys(dailyTotals).length > 0 ? (
          Object.entries(dailyTotals).map(([medicalAid, amount]) => (
            <div
              key={medicalAid}
              className="p-2 text-sm lg:text-base border-b border-gray-300"
            >
              <span>{medicalAid}: </span>
              <strong>${amount.toFixed(2)}</strong>
            </div>
          ))
        ) : (
          <p>No totals for this date.</p>
        )}
      </div>
    );
  };

  // Weekly view
  const renderWeeklyView = (date) => {
    const targetDate = searchDate ? new Date(searchDate) : date;
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const weeklyTotals = totals.reduce((acc, total) => {
      const totalDate = new Date(total.Date);
      if (totalDate >= startOfWeek && totalDate <= endOfWeek) {
        const amount = Number(total.Amount); // Convert to number
        acc[total.MedicalAid] = (acc[total.MedicalAid] || 0) + amount;
      }
      return acc;
    }, {});

    return (
      <div>
        <h4 className="lg:text-lg font-semibold">
          Weekly Totals ({startOfWeek.toISOString().split("T")[0]} to{" "}
          {endOfWeek.toISOString().split("T")[0]})
        </h4>
        {Object.keys(weeklyTotals).length > 0 ? (
          Object.entries(weeklyTotals).map(([medicalAid, amount]) => (
            <div
              key={medicalAid}
              className="p-2 border-b text-sm lg:text-base border-gray-300"
            >
              <span>{medicalAid}: </span>
              <strong>${amount.toFixed(2)}</strong>
            </div>
          ))
        ) : (
          <p>No totals for this week.</p>
        )}
      </div>
    );
  };

  // Monthly view
  const renderMonthlyView = (date) => {
    const targetDate = searchDate ? new Date(searchDate) : date;
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth(); // 0-11

    const monthlyTotals = totals.reduce((acc, total) => {
      const totalDate = new Date(total.Date);
      if (totalDate.getFullYear() === year && totalDate.getMonth() === month) {
        const amount = Number(total.Amount); // Convert to number
        acc[total.MedicalAid] = (acc[total.MedicalAid] || 0) + amount;
      }
      return acc;
    }, {});

    return (
      <div>
        <h4 className="lg:text-lg font-semibold">
          Monthly Totals for{" "}
          {targetDate.toLocaleString("default", { month: "long" })} {year}
        </h4>
        {Object.keys(monthlyTotals).length > 0 ? (
          Object.entries(monthlyTotals).map(([medicalAid, amount]) => {
            const isReceived = received.some(
              (item) =>
                item.medicalAid === medicalAid &&
                item.month ===
                  targetDate.toLocaleString("default", { month: "long" }) &&
                item.year === targetDate.getFullYear()
            );
            return (
              <div
                key={medicalAid}
                className="p-2 border-b text-sm lg:text-base grid grid-cols-3 border-gray-300"
              >
                <div className="col-span-2">
                  <span>{medicalAid}: </span>
                  <strong>${amount.toFixed(2)}</strong>
                </div>
                <button
                  onClick={() =>
                    handleReceivedClick(medicalAid, targetDate, amount)
                  }
                  className={`p-1 mx-auto rounded-md text-white mb-1 border ${
                    isReceived ? "bg-gray-400" : "bg-blue-600"
                  } flex items-end`}
                  disabled={isReceived}
                >
                  Received
                </button>
              </div>
            );
          })
        ) : (
          <p>No totals for this month.</p>
        )}
      </div>
    );
  };

  //save received to firebase
  const handleReceivedClick = async (medicalAid, targetDate, amount) => {
    try {
      const dataToSave = {
        month: targetDate.toLocaleString("default", { month: "long" }),
        year: targetDate.getFullYear(),
        medicalAid: medicalAid,
        amount: amount,
      };
      await addDoc(collection(db, "Received"), dataToSave);
    } catch (error) {
      console.error("Error saving: ", error);
    }
  };
  // Real-time listener for Received
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Received"), (snapshot) => {
      const receivedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReceived(receivedData);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
  //save to database
  const handleSaveClick = async () => {
    setLoading(true);
    const dateKey = new Date().toISOString();

    try {
      // Prepare medical aid data
      const medicalAidData = {};
      medicalAids.forEach((aid) => {
        const value = inputValues[aid.id] || null;
        if (value) {
          medicalAidData[aid.Medical] = value;
        }
      });
      const totalPromises = Object.keys(medicalAidData).map(
        async (medicalAid) => {
          return await addDoc(collection(db, "Totals"), {
            Date: dateKey,
            MedicalAid: medicalAid,
            Amount: medicalAidData[medicalAid],
            Locum: subD ? subD : false,
          });
        }
      );
      await Promise.all(totalPromises);
    } catch (error) {
      console.error("Error saving totals: ", error);
    } finally {
      setInputValues({});
      setLoading(false);
    }
  };

  return (
    <div className="p-1 lg:p-3">
      <div>
        <h2 className="text-lg lg:text-2xl font-semibold my-2 text-center text-blue-600">
          Totals
        </h2>
        {/* Select locum on duty */}
        <div className="flex justify-end">
          <button className={`${subD ? " " : "text-gray-500"} `}>
            <select
              value={subD}
              onChange={(e) => setSubD(e.target.value)}
              className="mt-1 block w-full p-2"
            >
              <option value="">Select Locum</option>
              {doctors
                .sort((a, b) => {
                  return a.Name.localeCompare(b.Name);
                })
                .map((doctor, index) => (
                  <option key={index} value={doctor.Name}>
                    {doctor.Name}
                  </option>
                ))}
            </select>
          </button>
        </div>
        {/* Save locum check times */}
        <div className={`flex gap-4 lg:gap-9 m-4 lg:m-8 ${!subD && "hidden"}`}>
          <div>
            <label>Checked In</label>
            <input
              value={cIn}
              onChange={(e) => setCIn(e.target.value)}
              type="time"
              className="mt-1 p-2 block border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div>
            <label>Checked Out</label>
            <input
              value={cOut}
              onChange={(e) => setCOut(e.target.value)}
              type="time"
              className="mt-1 p-2 block border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleSaveLog()}
            className="p-2 rounded bg-blue-600 my-auto text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Log
          </button>
        </div>
      </div>
      <div className="block mb-2 lg:mb-4">
        <label className="block font-medium mb-2">
          Search Date
          <input
            type="date"
            id="searchDate"
            value={searchDate}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </label>
      </div>
      {/*Select view */}
      <div>
        <div className="flex justify-between mb-2 lg:mb-4 ">
          <button
            onClick={() => setView("daily")}
            className={`p-2 rounded ${
              view === "daily"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`p-2 rounded ${
              view === "weekly"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`p-2 rounded ${
              view === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      {/*Change date */}
      <div className="flex justify-between mb-2 lg:mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded bg-blue-300"
        >
          <FaArrowLeft size={30} />
        </button>
        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded bg-blue-300"
        >
          <FaArrowRight size={30} />
        </button>
      </div>
      {renderCalendar()}
      <div className={`flex justify-between ${view === "monthly" && "hidden"}`}>
        <button
          className={`mt-4 p-2 rounded  text-white ${
            addTotal
              ? " bg-red-600 hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300"
              : " bg-green-600 hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
          }`}
          onClick={() => setAddTotal(!addTotal)}
        >
          {addTotal ? "Close" : "Add Totals"}
        </button>
        <button
          className={`underline ${
            openAll
              ? "text-red-600 hover:text-red-400"
              : "text-blue-600 hover:text-blue-400"
          }`}
          onClick={() => setOpenAll(!openAll)}
        >
          {openAll ? "Close X" : "View Transactions"}
        </button>
      </div>
      {openAll && viewAll()}
      {addTotal && (
        <div>
          <h3 className="text-lg lg:text-xl font-semibold lg:p-6 p-3 text-center text-blue-600">
            Medical Aids
          </h3>

          {medicalAids
            .sort((a, b) => {
              return a.Medical.localeCompare(b.Medical);
            })
            .map((aid) => (
              <div
                key={aid.id}
                className="flex items-center text-sm lg:text-base p-1 lg:p-3 border-b border-blue-100"
              >
                <span className="font-serif flex-1">{aid.Medical}</span>
                <input
                  type="text"
                  className="border rounded p-2 ml-4"
                  placeholder="Enter Amount"
                  value={inputValues[aid.id] || ""}
                  onChange={(e) => handleInputChange(aid.id, e.target.value)}
                />
              </div>
            ))}
          <button
            onClick={handleSaveClick}
            disabled={loading}
            className={`mt-4 w-1/2 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? <span>Saving...</span> : "Save"}
          </button>
        </div>
      )}
      {/* Render Chart */}
      <div className={`hidden lg:block p-3 ${view === "daily" && "hidden"}`}>
        {Object.keys(trendData).length > 0 ? (
          <Bar data={prepareChartData()} />
        ) : (
          <p>No data available for trends.</p>
        )}
      </div>
    </div>
  );
};

export default Totals;
