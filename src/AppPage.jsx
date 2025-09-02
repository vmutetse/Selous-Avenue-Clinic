import React, { useContext, useEffect, useState } from "react";
import { Globals } from "../Globals";
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
import { db } from "../firebase";

const AppPage = (prop) => {
  const {
    rbs,
    setRbs,
    details,
    appointments,
    loading,
    setOpenFull,
    setId,
    complaint,
    setComplaint,
    patient,
    i,
    temperature,
    setTemperature,
    systolic,
    setSystolic,
    diastolic,
    setDiastolic,
    heart,
    setHeart,
    oxygen,
    setOxygen,
    weigh,
    setWeigh,
    high,
    setHigh,
    bmi,
    setBmi,
    extra,
    setExtra,
    allergies,
    setAllergies,
    meds,
    setMeds,
    probs,
    setProbs,
    subjective,
    setSubjective,
    objective,
    setObjective,
    diagnosis,
    setDiagnosis,
    diffDiagnosis,
    setDiffDiagnosis,
    treatPlan,
    setTreatPlan,
    diagnosisSuggest,
    setDiagnosisSuggest,
    openSuggest,
    setOpenSuggest,
    newSuggest,
    setNewSuggest,
    filteredSuggestions,
    setFilteredSuggestions,
    suggestionSelected,
    setSuggestionSelected,
    openEdit,
    injections,
    injected,
    setInjected,
    locum,
  } = useContext(Globals);

  const [activeTab, setActiveTab] = useState("signs");

  //open full appointment details
  function handleFieldClick(appId) {
    setOpenFull(true);
    setId(appId);
  }

  // Real-time listener for Push
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Push"), (snapshot) => {
      const pushData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (pushData.length > 0 && i !== null && appointments[i]) {
        const latestPush = pushData.find(
          (push) =>
            push.Name === appointments[i].Patient &&
            push.Time === appointments[i].time &&
            push.Date === appointments[i].date
        );
        if (latestPush) {
          setTemperature(latestPush.Temperature);
          setSystolic(latestPush.Systolic);
          setDiastolic(latestPush.Diastolic);
          setHeart(latestPush.Heart);
          setOxygen(latestPush.Oxygen);
          setWeigh(latestPush.Weight);
          setHigh(latestPush.Height);
          setBmi(latestPush.BMI);
          setRbs(latestPush.Rbs);
        }
      }
    });
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [appointments, i]);
  //Push to doc's side
  const handlePushClick = async () => {
    await setDoc(doc(db, "Push", appointments[i].Patient), {
      Date: appointments[i].date,
      Name: appointments[i].Patient,
      Time: appointments[i].time,
      Temperature: temperature,
      Systolic: systolic,
      Diastolic: diastolic,
      Heart: heart,
      Oxygen: oxygen,
      Weight: weigh,
      Height: high,
      BMI: weigh / (high * high),
      RBS: rbs,
    });
  };

  //diagnosis suggestion
  const handleDiagnosisChange = (e) => {
    const value = e.target.value;
    setDiagnosis(value);
    // Filter suggestions based on the input value after the last semicolon
    const parts = value.split(";");
    const lastPart = parts[parts.length - 1].trim();
    if (lastPart) {
      const filtered = diagnosisSuggest.filter((suggestion) =>
        suggestion.Suggestion.toLowerCase().includes(lastPart.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setSuggestionSelected(false);
    } else {
      setFilteredSuggestions([]);
      setSuggestionSelected(false);
    }
  };
  const handleDSuggestionClick = (suggestion) => {
    const parts = diagnosis.split(";");
    parts[parts.length - 1] = suggestion;
    const newDiagnosis = parts.join("; ") + "; ";
    setDiagnosis(newDiagnosis);
    setFilteredSuggestions([]);
    setSuggestionSelected(true);
  };
  // Function to calculate age
  const calculateAge = () => {
    if (!patient || !patient.Dob) {
      return "N/A";
    }
    const dob = new Date(patient.Dob);
    if (isNaN(dob.getTime())) {
      return "Invalid date";
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    // Adjust age if the birthday hasn't occurred yet this year
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    return age;
  };
  // Real-time listener for diagnosis suggestion
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "DiagnosisSuggest"),
      (snapshot) => {
        const suggestData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDiagnosisSuggest(suggestData);
      }
    );
    return () => unsubscribe();
  }, []);
  //save diagnosis suggestion
  const handleSaveDClick = async (suggest) => {
    if (!suggest) return;
    try {
      const newSuggest = { Suggestion: suggest };
      await addDoc(collection(db, "DiagnosisSuggest"), newSuggest);
      setNewSuggest("");
    } catch (error) {
      console.error("Error creating medical aid: ", error);
    }
  };
  return (
    <div
      className={` bg-black p-1 bg-opacity-80 min-h-screen overflow-auto h-auto inset-0 flex items-center justify-center`}
    >
      <div
        className={`bg-white p-8 rounded-lg shadow-lg w-full max-w-xl ${
          openSuggest ? "opacity-50" : ""
        }`}
        style={{ margin: "auto" }}
      >
        <h2 className="text-lg lg:text-2xl font-semibold my-2 text-center ">
          {prop.text}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm lg:text-base">
          <label className="block mb-2 font-medium">Patient's Name:</label>
          <span className="block mb-2">{patient.Name}</span>
          <label className="block mb-2 font-medium">Age:</label>
          <span className="block mb-2">{calculateAge()}</span>
          <label className="block mb-2 font-medium">Doctor:</label>
          <span className="block mb-2">{locum ? locum : "G Mutetse"}</span>
          <label className="block mb-2 font-medium">Date:</label>
          <span className="block mb-2">{appointments[i].date}</span>
          <label className="block mb-2 font-medium">Health Center:</label>
          <span className="block mb-2">Selous Avenue Clinic</span>
          <label className="block mb-2 font-medium">Medical Aid:</label>
          <span className="block mb-2">
            {patient.MedicalAid ? patient.MedicalAid : "N/A"}
          </span>
        </div>
        {/* App Table */}
        <div className={openEdit && "hidden"}>
          {details.filter((d) => d.Name === patient.Name).length > 0 ? (
            <table className="min-w-full text-sm lg:text-base bg-white border border-gray-300 rounded-lg my-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left ">
                    Patient
                  </th>
                  <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left">
                    Diagnosis
                  </th>
                  <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left">
                    Injections
                  </th>
                  <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {details
                  .filter((d) => d.Name === patient.Name)
                  .sort((a, b) => new Date(b.Date) - new Date(a.Date))
                  .map((detail, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleFieldClick(detail.id)}
                    >
                      <td className="py-1 px-2 lg:py-2 lg:px-4 border-b">
                        {detail.Name}
                      </td>
                      <td className="py-1 px-2 lg:py-2 lg:px-4 border-b">
                        {detail.Diagnosis}
                      </td>
                      <td className="py-1 px-2 lg:py-2 lg:px-4 border-b">
                        {detail.Injected &&
                          detail.Injected.map((injection) => (
                            <ul key={injection.id}>
                              <li>{injection.name}</li>
                            </ul>
                          ))}
                      </td>
                      <td className="py-1 px-2 lg:py-2 lg:px-4 border-b">
                        {detail.Date}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            ""
          )}
        </div>
        <label className="block mb-2">
          <span className="font-medium">Chief Complaints</span>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            rows="4"
          ></textarea>
        </label>
        {/* Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("signs")}
            className={`text-blue-800 font-medium rounded-md lg:text-lg p-2 ${
              activeTab === "signs"
                ? "shadow-sm  border-t border-l border-r border-gray-200"
                : " hover:bg-gray-100"
            }`}
          >
            Signs
          </button>
          <button
            onClick={() => setActiveTab("soap")}
            className={`text-blue-800 font-medium rounded-md lg:text-lg p-2 ${
              activeTab === "soap"
                ? "shadow-sm  border-t border-l border-r border-gray-200"
                : " hover:bg-gray-100"
            }`}
          >
            Presenting Complaints
          </button>
          <button
            onClick={() => setActiveTab("physical exam")}
            className={`text-blue-800 font-medium rounded-md lg:text-lg p-2 ${
              activeTab === "physical exam"
                ? " shadow-sm  border-t border-l border-r border-gray-200"
                : " hover:bg-gray-100"
            }`}
          >
            Physical Exam
          </button>
          <button
            onClick={() => setActiveTab("diagnosis")}
            className={`text-blue-800 font-medium rounded-md lg:text-lg p-2 ${
              activeTab === "diagnosis"
                ? "shadow-sm  border-t border-l border-r border-gray-200"
                : " hover:bg-gray-100"
            }`}
          >
            Diagnosis
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`text-blue-800 font-medium rounded-md lg:text-lg p-2 ${
              activeTab === "info"
                ? "shadow-sm  border-t border-l border-r border-gray-200"
                : " hover:bg-gray-100"
            }`}
          >
            Extra Information
          </button>
        </div>
        {/* Signs */}
        <div
          className={
            activeTab === "signs" ? " p-3 border-b border-gray-300" : "hidden"
          }
        >
          <div>
            <h2 className="lg:text-xl text-blue-400 p-1 lg:p-3">Vital Signs</h2>
            <div className="grid grid-cols-2 text-sm lg:text-base">
              <label className="mb-2">
                Temperature:
                <input
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  type="number"
                  className="mt-1 border w-3/4 border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label className="mb-2">
                Systolic Pressure:
                <input
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  type="number"
                  className="mt-1 border w-3/4 border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label className=" mb-2">
                Diastolic Pressure:
                <input
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  type="number"
                  className="mt-1 w-3/4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label className="mb-2">
                Heart Rate:
                <input
                  value={heart}
                  onChange={(e) => setHeart(e.target.value)}
                  type="number"
                  className="mt-1 w-3/4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label className="block mb-2">
                Oxygen Saturation:
                <input
                  value={oxygen}
                  onChange={(e) => setOxygen(e.target.value)}
                  type="number"
                  className="mt-1 w-3/4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label className="block mb-2">
                RBS: {<br />}
                <input
                  value={rbs}
                  onChange={(e) => setRbs(e.target.value)}
                  type="number"
                  className="mt-1 w-3/4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
          <div>
            <h2 className="lg:text-xl text-blue-400 p-3">Anthropometry</h2>
            <div className="grid text-sm lg:text-base grid-cols-2">
              <label className="mb-2">
                Weight:
                <input
                  value={weigh}
                  onChange={(e) => setWeigh(e.target.value)}
                  type="number"
                  className="mt-1 w-3/4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label className="mb-2">
                Height:
                <input
                  value={high}
                  onChange={(e) => setHigh(e.target.value)}
                  type="number"
                  className="mt-1 w-3/4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label className="mb-2">
                Body Mass Index (BMI):{" "}
                <span className="border px-3 rounded-md">{bmi}</span>
              </label>
            </div>
          </div>
        </div>
        {/* Physical Exam */}
        <div
          className={
            activeTab === "physical exam"
              ? "block p-3 border-b border-gray-300"
              : "hidden"
          }
        >
          <div>
            <div className="grid grid-cols-3 text-sm lg:text-base gap-4">
              <label className=" font-medium border-r col-span-1 border-gray-300">
                Findings
              </label>
              <textarea
                value={probs}
                onChange={(e) => setProbs(e.target.value)}
                className="border col-span-2 border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>
        </div>
        {/* Presenting Complaints */}
        <div
          className={
            activeTab === "soap" ? "p-3 border-b border-gray-300" : "hidden"
          }
        >
          <div className="grid grid-cols-3 gap-4 text-sm lg:text-base">
            <label className="font-medium border-r col-span-1 border-gray-300">
              Subjective
            </label>
            <textarea
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              type="text"
              className="col-span-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
              rows={4}
            />
            <label className="block font-medium border-r col-span-1 border-gray-300">
              Past Medical History
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              type="text"
              className="col-span-2 block border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
              rows={4}
            />
            <label className="block font-medium border-r col-span-1 border-gray-300">
              Current Medications
            </label>
            <textarea
              value={meds}
              onChange={(e) => setMeds(e.target.value)}
              type="text"
              className="block border col-span-2 border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
              rows={4}
            />
            <label className="block font-medium border-r col-span-1 border-gray-300">
              Allergies
            </label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              type="text"
              className="block border col-span-2 border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>
        {/* Diagnosis */}
        <div
          className={
            activeTab === "diagnosis"
              ? "p-3 border-b border-gray-300"
              : "hidden"
          }
        >
          <div>
            <label className="text-sm lg:text-base mb-2 font-medium">
              Diagnosis
            </label>
            <input
              value={diagnosis}
              onChange={handleDiagnosisChange}
              type="text"
              className="border w-full border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            />
            {/* Suggestions Dropdown */}
            {filteredSuggestions.length > 0 ? (
              <ul className="absolute bg-white border border-gray-300 mt-1 z-10">
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      handleDSuggestionClick(suggestion.Suggestion)
                    }
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {suggestion.Suggestion}
                  </li>
                ))}
              </ul>
            ) : (
              diagnosis &&
              !suggestionSelected && (
                <button
                  onClick={() => setOpenSuggest(true)}
                  className="mt-2 bg-gray-100 p-2"
                >
                  New...
                </button>
              )
            )}
            <label className="mb-2 font-medium">Differential Diagnosis</label>
            <textarea
              value={diffDiagnosis}
              onChange={(e) => setDiffDiagnosis(e.target.value)}
              type="text"
              className="border w-full border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
              rows={4}
            />
            <label className="my-2 font-medium">Plan</label>
            <textarea
              value={treatPlan}
              onChange={(e) => setTreatPlan(e.target.value)}
              className="border w-full border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
              rows={4}
            />
            {injections.length > 0 && (
              <>
                <label className="my-2 font-medium">Injection</label>
                <div className="space-y-2">
                  {injections.map((injection, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        value={injection.name}
                        checked={injected.some(
                          (item) => item.id === injection.id
                        )} // Check if the injection is included based on ID
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            setInjected((prev) => [...prev, injection]); // Add the whole injection object
                          } else {
                            setInjected((prev) =>
                              prev.filter((item) => item.id !== injection.id)
                            ); // Remove by ID
                          }
                        }}
                        className="mr-2"
                      />
                      {injection.name}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        {/* Extra Information */}
        <div
          className={
            activeTab === "info"
              ? "block p-3 border-b border-gray-300"
              : "hidden"
          }
        >
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className="mt-1 text-sm block border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500 w-full"
            rows="4"
          />
        </div>
        {/* Buttons */}
        <div className="flex justify-center text-sm lg:text-base mt-3 lg:mt-6 gap-4">
          <button
            onClick={prop.fxn1}
            disabled={loading}
            className={`mt-4 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? <span>Saving...</span> : "Save"}
          </button>
          <button
            className="mt-4 p-2 rounded bg-green-700 text-white hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-300 transition duration-200"
            onClick={handlePushClick}
          >
            Push
          </button>
          <button
            className="mt-4 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 transition duration-200"
            onClick={prop.fxn2}
          >
            Close
          </button>
        </div>
      </div>
      {openSuggest && (
        <div className="max-w-md bg-white p-8 absolute ">
          <input
            type="text"
            placeholder="New Diagnosis"
            value={newSuggest}
            onChange={(e) => setNewSuggest(e.target.value)}
            className="border p-3"
          />
          <div>
            <button
              className="bButton"
              onClick={() => handleSaveDClick(newSuggest)}
            >
              Save
            </button>
            <button className={"gButton"} onClick={() => setOpenSuggest(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppPage;
