import React, { useState, useEffect, useContext } from "react";
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
import { Globals } from "../Globals";
import PatientForm from "./PatientForm.jsx";
import { FaRegTrashCan } from "react-icons/fa6";
import AppPage from "./AppPage.jsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const Appointments = () => {
  const {
    openApp,
    rbs,
    setRbs,
    admin,
    setOpenApp,
    patients,
    appointments,
    details,
    handleCreatePatient,
    setLoading,
    id,
    setId,
    openFull,
    setOpenFull,
    complaint,
    setComplaint,
    patient,
    setPatient,
    i,
    setI,
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
    createPatient,
    setCreatePatient,
    openEdit,
    setOpenEdit,
    injected,
    setInjected,
    setLocum,
    locum,
    doctors,
  } = useContext(Globals);

  const [view, setView] = useState("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [inputValues, setInputValues] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [previousInjected, setPreviousInjected] = useState([]);
  const [password, setPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  //validate change from locum to usual
  const handleLocChange = (e) => {
    if (e.target.value === "") {
      setShowPasswordPrompt(true);
    } else {
      setLocum(e.target.value);
    }
  };
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    let match = false;

    admin.forEach((admin1) => {
      if (admin1.password === password) {
        match = true;
        setLocum("");
        setShowPasswordPrompt(false);
      }
    });

    if (!match) {
      alert("Invalid Password");
    }
    setPassword("");
  };

  //add appointment to database
  const handleAddAppointment = async (date, time, name) => {
    if (!name) return; // Prevent adding empty names
    try {
      const dateKey = new Date().toISOString();
      const newAppointment = { date, time, Patient: name, dateKey };
      await addDoc(collection(db, "CalendarApp"), newAppointment);
    } catch (error) {
      console.error("Error adding appointment: ", error);
    }
  };
  //delete appointment details
  const handleDeleteClick = async (identity) => {
    try {
      await deleteDoc(doc(db, "Appointments", identity));
    } catch (error) {
      alert("Could not delete!");
    } finally {
      setOpenFull(false);
      closeModal();
    }
  };
  //delete appointment
  const deleteAppointment = async (identity) => {
    await deleteDoc(doc(db, "CalendarApp", identity));
  };
  //close appointment details
  const handleCloseClick = () => {
    resetSignsForm();
    setI(null);
    setOpenApp(false);
    setPatient({});
  };
  const resetSignsForm = () => {
    setTemperature(0);
    setSystolic(0);
    setDiastolic(0);
    setHeart(0);
    setOxygen(0);
    setWeigh(0);
    setHigh(0);
    setBmi(0);
    setRbs(0);
  };
  //handle next and previous buttons
  const changeDate = (amount) => {
    const newDate = new Date(currentDate);
    if (view === "daily") {
      newDate.setDate(newDate.getDate() + amount);
    } else if (view === "weekly") {
      newDate.setDate(newDate.getDate() + amount * 7);
    } else if (view === "monthly") {
      newDate.setMonth(newDate.getMonth() + amount);
    }
    setCurrentDate(newDate);
  };
  //display suggestions
  const handleNameChange = (e, dateString, time) => {
    const inputValue = e.target.value;
    setInputValues((prev) => ({
      ...prev,
      [`${dateString}-${time}`]: inputValue,
    }));
    // Filter suggestions based on input value
    if (inputValue) {
      const filteredSuggestions = patients.filter((patient) =>
        patient.Name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setActiveSuggestion(`${dateString}-${time}`);
    } else {
      setSuggestions([]);
      setActiveSuggestion(null);
    }
  };
  //Patient suggestion
  const handleSuggestionClick = (suggestion) => {
    if (activeSuggestion) {
      setInputValues((prev) => ({
        ...prev,
        [activeSuggestion]: suggestion,
      }));
      setSuggestions([]);
      setActiveSuggestion(null);
    }
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
  //open appointment page
  const handleAppClick = (index) => {
    setI(index);
  };
  // Handle date change from date picker
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (!isNaN(selectedDate.getTime())) {
      setCurrentDate(selectedDate);
    } else {
      console.warn("Invalid date selected");
    }
  };
  // Calculate start and end of the week
  const getStartOfWeek = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    return start;
  };
  // Daily view
  const renderDailyView = (date) => {
    const dateString = date.toISOString().split("T")[0];
    const dailyAppointments = appointments.filter(
      (app) => app.date === dateString
    );
    const dailyCount = dailyAppointments.length; // Count for daily

    return (
      <div className="p-1 lg:p-4">
        <h3 className="lg:text-lg font-semibold">
          Appointments for {date.toDateString()}
        </h3>
        <div className="grid text-sm lg:text-base lg:grid-cols-4 gap-4 mt-4">
          {[...Array(9)].map((_, index) => {
            const hour = 9 + index;
            return (
              <div key={index} className="border p-2 text-center">
                {hour}:00
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Patient Name"
                    value={inputValues[`${dateString}-${hour}:00`] || ""}
                    onChange={(e) =>
                      handleNameChange(e, dateString, `${hour}:00`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddAppointment(
                          dateString,
                          `${hour}:00`,
                          inputValues[`${dateString}-${hour}:00`]
                        );
                        setInputValues((prev) => ({
                          ...prev,
                          [`${dateString}-${hour}:00`]: "",
                        }));
                      }
                    }}
                    className="mt-1 border w-3/4 rounded p-1"
                  />
                  {/* Suggestions Dropdown */}
                  {activeSuggestion === `${dateString}-${hour}:00` ? (
                    suggestions.length > 0 ? (
                      <ul className="absolute bg-white border border-gray-300 mt-1 z-10">
                        {suggestions.map((suggestion, idx) => (
                          <li
                            key={idx}
                            onClick={() =>
                              handleSuggestionClick(suggestion.Name)
                            }
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                          >
                            {suggestion.Name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div
                        onClick={() => setCreatePatient(true)}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        create...
                      </div>
                    )
                  ) : null}
                  <div className="mt-2">
                    {dailyAppointments
                      .filter((app) => app.time === `${hour}:00`)
                      .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey))
                      .map((app, idx) => {
                        const originalIndex = appointments.findIndex(
                          (originalApp) => originalApp.id === app.id
                        );
                        return (
                          <div key={idx}>
                            <span
                              className="text-sm text-blue-600 cursor-pointer hover:underline"
                              onClick={() => handleAppClick(originalIndex)}
                            >
                              {app.Patient}
                            </span>
                            <button
                              onClick={() => deleteAppointment(app.id)}
                              className="text-red-600"
                            >
                              <FaRegTrashCan />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 lg:mt-4 lg:text-lg font-semibold">
          Total Appointments: {dailyCount}
        </div>
      </div>
    );
  };
  // Weekly view
  const renderWeeklyView = (date) => {
    const startOfWeek = getStartOfWeek(date);
    const weeklyAppointments = [];

    return (
      <div className="hidden lg:block p-4">
        <h3 className="text-lg font-semibold">Appointments for the week</h3>
        <div className="grid grid-cols-6 gap-4 mt-4">
          {/* 6 columns for Monday to Saturday */}
          {[...Array(6)].map((_, index) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + index);
            const dateString = day.toISOString().split("T")[0];

            const dailyApps = appointments.filter(
              (app) => app.date === dateString
            );
            weeklyAppointments.push(...dailyApps); // Collect weekly appointments

            return (
              <div key={index} className="border p-2">
                <h4 className="text-center font-semibold">
                  {day.toDateString()}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {[...Array(9)].map((_, hourIndex) => {
                    const hour = 9 + hourIndex;
                    return (
                      <div key={hourIndex} className="border p-1 text-center">
                        {hour}:00
                        <input
                          type="text"
                          placeholder="Patient Name"
                          value={inputValues[`${dateString}-${hour}:00`] || ""}
                          onChange={(e) =>
                            handleNameChange(e, dateString, `${hour}:00`)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddAppointment(
                                dateString,
                                `${hour}:00`,
                                inputValues[`${dateString}-${hour}:00`]
                              );
                              setInputValues((prev) => ({
                                ...prev,
                                [`${dateString}-${hour}:00`]: "",
                              }));
                            }
                          }}
                          className="mt-1 border w-3/4 rounded p-1"
                        />
                        {/* Suggestions Dropdown */}
                        {activeSuggestion === `${dateString}-${hour}:00` ? (
                          suggestions.length > 0 ? (
                            <ul className="absolute bg-white border border-gray-300 mt-1 z-10">
                              {suggestions.map((suggestion, idx) => (
                                <li
                                  key={idx}
                                  onClick={() =>
                                    handleSuggestionClick(suggestion.Name)
                                  }
                                  className="p-2 hover:bg-gray-200 cursor-pointer"
                                >
                                  {suggestion.Name}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div
                              onClick={() => setCreatePatient(true)}
                              className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                              create...
                            </div>
                          )
                        ) : null}
                        <div className="mt-2">
                          {dailyApps
                            .filter((app) => app.time === `${hour}:00`)
                            .sort(
                              (a, b) =>
                                new Date(a.dateKey) - new Date(b.dateKey)
                            )
                            .map((app, idx) => {
                              const originalIndex = appointments.findIndex(
                                (originalApp) => originalApp.id === app.id
                              );
                              return (
                                <div key={idx}>
                                  <span
                                    className={
                                      "text-sm text-blue-600 cursor-pointer hover:underline"
                                    }
                                    onClick={() =>
                                      handleAppClick(originalIndex)
                                    }
                                  >
                                    {app.Patient}
                                  </span>
                                  <button
                                    onClick={() => deleteAppointment(app.id)}
                                    className="text-red-600"
                                  >
                                    <FaRegTrashCan />
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-lg font-semibold">
          Total Appointments: {weeklyAppointments.length}
        </div>
      </div>
    );
  };
  // Monthly view
  const renderMonthlyView = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const monthlyAppointments = [];

    return (
      <div className="hidden lg:block p-4">
        <h3 className="text-lg font-semibold">
          Appointments for{" "}
          {firstDay.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <div className="grid grid-cols-7 gap-4 mt-4">
          {[...Array(startDay)].map((_, index) => (
            <div key={index} className="border p-2"></div>
          ))}
          {/* Loop through all days in the month */}
          {[...Array(daysInMonth)].map((_, index) => {
            const dayDate = index + 1;
            const dateString = `${year}-${(month + 1)
              .toString()
              .padStart(2, "0")}-${dayDate.toString().padStart(2, "0")}`;

            const dailyApps = appointments.filter(
              (app) => app.date === dateString
            );
            monthlyAppointments.push(...dailyApps); // Collect monthly appointments

            return (
              <div key={index} className="border p-2 text-center">
                {dayDate}
                <div className="mt-2">
                  {dailyApps
                    .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey))
                    .map((app, idx) => (
                      <div key={idx} className="text-sm text-blue-600">
                        {app.Patient}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-lg font-semibold">
          Total Appointments: {monthlyAppointments.length}
        </div>
      </div>
    );
  };
  //save state of locum to local storage
  useEffect(() => {
    localStorage.setItem("locum", locum);
  }, [locum]);
  //Save appointment details to firebase
  const handleSaveClick = async () => {
    setLoading(true);
    const dateKey = new Date().toISOString();
    const formattedProbs = probs.split("\n");
    const formattedPlan = treatPlan.split("\n");

    try {
      await addDoc(collection(db, "Appointments"), {
        Date: appointments[i].date,
        time: dateKey,
        Name: appointments[i].Patient,
        Complaint: complaint,
        MedicalAid: patient.MedicalAid,
        Temperature: temperature,
        Systolic: systolic,
        Diastolic: diastolic,
        Heart: heart,
        Oxygen: oxygen,
        Weight: weigh,
        Height: high,
        BMI: bmi,
        Extra: extra,
        Allergies: allergies,
        Meds: meds,
        Probs: formattedProbs,
        Subjective: subjective,
        Objective: objective,
        Diagnosis: diagnosis,
        Differential: diffDiagnosis,
        Treatment: formattedPlan,
        RBS: rbs,
        Injected: injected,
        Locum: locum ? locum : false,
      });

      // Update patient weight and height
      const docRef = doc(db, "Patients", patient.id);
      await updateDoc(docRef, {
        ...(weigh !== 0 && { Weight: weigh }),
        ...(high !== 0 && { Height: high }),
        ...(weigh !== 0 || (high !== 0 && { BMI: weigh / (high * high) })),
      });

      // Update stock
      for (const injection of injected) {
        const docRefS = doc(db, "Injections", injection.id);
        await updateDoc(docRefS, {
          quantity: Number(injection.quantity) - 1,
        });
      }

      // Show success message
      setModalMessage("Appointment saved successfully!");
      resetFormFields();
    } catch (error) {
      console.error("Error saving appointment: ", error);
      setModalMessage("Failed to save appointment. Please try again.");
    } finally {
      setLoading(false);
      setModalVisible(true);
      
    }
  };

  const resetFormFields = () => {
    setComplaint("");
    setTemperature(0);
    setSystolic(0);
    setDiastolic(0);
    setHeart(0);
    setOxygen(0);
    setWeigh(0);
    setHigh(0);
    setBmi(0);
    setExtra("");
    setAllergies("");
    setMeds("");
    setRbs(0);
    setProbs("");
    setSubjective("");
    setObjective("");
    setDiagnosis("");
    setDiffDiagnosis("");
    setTreatPlan("");
    setInjected([]);
  };

  const closeModalS = () => {
    setModalVisible(false);
  };
  //clear fields
  function resetForm() {
    setComplaint("");
    setTemperature(0);
    setSystolic(0);
    setDiastolic(0);
    setHeart(0);
    setOxygen(0);
    setWeigh(0);
    setHigh(0);
    setBmi(0);
    setRbs(0);
    setExtra("");
    setAllergies("");
    setMeds("");
    setProbs("");
    setSubjective("");
    setObjective("");
    setDiagnosis("");
    setDiffDiagnosis("");
    setTreatPlan("");
    setLoading(false);
    setInjected([]);
  }
  //close full appointment details
  function closeApp() {
    setOpenFull(false);
    setId(null);
  }
  //PDF Generation
  const generatePDF = async () => {
    const input = document.getElementById("contentToPrint");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 190;
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(appointments[i].Patient + "-health report.pdf");
  };
  //match patient to appointment
  useEffect(() => {
    if (appointments[i]) {
      const patientName = appointments[i].Patient;
      const foundPatient = patients.find(
        (patient) => patient.Name === patientName
      );
      foundPatient && setOpenApp(true);
      foundPatient && setHigh(foundPatient.Height);
      foundPatient && setWeigh(foundPatient.Weight);
      foundPatient && setBmi(foundPatient.BMI);
      !foundPatient && alert("Patient is not saved");
      setPatient(foundPatient);
    }
  }, [patients, i]);
  //Restore appointment data for edit
  function handleEditClick() {
    const clickedDate = details.filter((d) => d.id === id)[0]?.Date;
    const filteredDetails = details.filter(
      (d) =>
        d.Date === clickedDate &&
        d.Name.toLowerCase() === appointments[i].Patient.toLowerCase() &&
        d.id === id
    );
    const latestDetail = filteredDetails.length > 0 ? filteredDetails[0] : null;
    if (latestDetail) {
      setWeigh(latestDetail.Weight);
      setHigh(latestDetail.Height);
      setBmi(latestDetail.BMI);
      setSubjective(latestDetail.Subjective);
      setObjective(latestDetail.Objective);
      setMeds(latestDetail.Meds);
      setAllergies(latestDetail.Allergies);
      setTemperature(latestDetail.Temperature);
      setSystolic(latestDetail.Systolic);
      setDiastolic(latestDetail.Diastolic);
      setHeart(latestDetail.Heart);
      setOxygen(latestDetail.Oxygen);
      setProbs(latestDetail.Probs);
      setDiagnosis(latestDetail.Diagnosis);
      setDiffDiagnosis(latestDetail.Differential);
      setTreatPlan(latestDetail.Treatment);
      setExtra(latestDetail.Extra);
      setComplaint(latestDetail.Complaint);
      setInjected((prev) => [...prev, ...latestDetail.Injected]);
      setPreviousInjected(latestDetail.Injected || []);
      setRbs(latestDetail.RBS);
      setOpenApp(false);
      setOpenEdit(true);
    }
  }
  //close edit page
  function closeEdit() {
    resetForm();
    setOpenApp(true);
    setOpenEdit(false);
  }
  //update appointment details
  const handleUpdate = async () => {
    setLoading(true);
    const updateRef = doc(db, "Appointments", id);

    try {
      await updateDoc(updateRef, {
        Complaint: complaint,
        MedicalAid: patient.MedicalAid,
        Temperature: temperature,
        Systolic: systolic,
        Diastolic: diastolic,
        Heart: heart,
        Oxygen: oxygen,
        Weight: weigh,
        Height: high,
        BMI: bmi,
        Extra: extra,
        Allergies: allergies,
        Meds: meds,
        Probs: probs,
        Subjective: subjective,
        Objective: objective,
        Diagnosis: diagnosis,
        Differential: diffDiagnosis,
        Treatment: treatPlan,
        Injected: injected,
      });
      //update to new weight and height
      const docRef = doc(db, "Patients", patient.id);
      try {
        await updateDoc(docRef, {
          Weight: weigh,
          Height: high,
        });
      } catch (error) {
        console.error("Error updating document: ", error);
      }
      //update stock
      for (const injection of injected) {
        const docRefS = doc(db, "Injections", injection.id);
        if (!previousInjected.includes(injection.id)) {
          // If the injection is newly selected, decrement the stock
          try {
            await updateDoc(docRefS, {
              quantity: Number(injection.quantity) - 1,
            });
          } catch (error) {
            console.error("Error updating injection document: ", error);
          }
        }
      }

      // Increment stock for deselected injections
      for (const injection of previousInjected) {
        if (!injected.some((item) => item.id === injection)) {
          const docRefS = doc(db, "Injections", injection.id);
          try {
            await updateDoc(docRefS, {
              quantity: Number(injection.quantity) + 1,
            });
          } catch (error) {
            console.error("Error updating injection document: ", error);
          }
        }
      }
    } catch (error) {
      console.error("Error saving updates: ", error);
    } finally {
      setComplaint("");
      setTemperature(0);
      setSystolic(0);
      setDiastolic(0);
      setHeart(0);
      setOxygen(0);
      setWeigh(0);
      setHigh(0);
      setBmi(0);
      setExtra("");
      setAllergies("");
      setMeds("");
      setProbs("");
      setRbs(0);
      setSubjective("");
      setObjective("");
      setDiagnosis("");
      setDiffDiagnosis("");
      setTreatPlan("");
      setInjected([]);
      setPreviousInjected([]);
      setOpenEdit(false);
      setOpenApp(true);
      setLoading(false);
    }
  };
  //confirm delete
  const showAlert = () => {
    setModalOpen(true);
  };
  //Close delete tab
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="bg-blue-50 min-h-screen p-4">
      {createPatient && (
        <PatientForm
          text="Add Patient"
          fxn1={handleCreatePatient}
          fxn2={() => setCreatePatient(false)}
        />
      )}
      {openApp && (
        <AppPage
          text="Appointment Details"
          fxn1={() => handleSaveClick()}
          fxn2={() => handleCloseClick()}
        />
      )}
      {openEdit && (
        <AppPage
          text="Edit Appointment Details"
          fxn1={() => handleUpdate()}
          fxn2={() => closeEdit()}
        />
      )}
      <div className={createPatient || openApp || openFull ? "hidden" : ""}>
        <div className="flex justify-between">
          <h1 className=" text-lg lg:text-2xl font-bold text-blue-800 mb-2 lg:mb-4">
            Appointments
          </h1>
          <button className={`${locum ? "" : "text-gray-500"}`}>
            <select
              value={locum}
              onChange={handleLocChange}
              className="mt-1 block w-full p-2"
            >
              <option value="">Select Locum</option>
              {doctors
                .sort((a, b) => a.Name.localeCompare(b.Name))
                .map((doctor, index) => (
                  <option key={index} value={doctor.Name}>
                    {doctor.Name}
                  </option>
                ))}
            </select>
          </button>

          {showPasswordPrompt && (
            <form onSubmit={handlePasswordSubmit} className="mt-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="p-2 border"
                required
              />
              <button type="submit" className="ml-2 p-2 bg-blue-500 text-white">
                Submit
              </button>
            </form>
          )}
        </div>

        <div className="flex justify-center p-4 lg:p-8">
          <input
            type="date"
            onChange={handleDateChange}
            className="border p-2 rounded"
          />
        </div>
        {/* View buttons */}
        <div className="flex justify-between mb-2 lg:mb-4 ">
          <button
            onClick={() => setView("daily")}
            className={`p-2 rounded ${
              view === "daily"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`p-2 rounded hidden lg:block ${
              view === "weekly"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`p-2 rounded hidden lg:block ${
              view === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
          >
            Monthly View
          </button>
        </div>
        {/* Next buttons */}
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
      </div>
      {/* Full appointment details */}
      <div>
        {openFull && !openEdit && (
          <div className="fixed inset-0 bg-blue-50 flex flex-col p-4 overflow-auto">
            {(() => {
              const clickedDate = details.filter((d) => d.id === id)[0]?.Date;
              const filteredDetails = details.filter(
                (d) =>
                  d.Date === clickedDate &&
                  d.Name.toLowerCase() === patient.Name.toLowerCase() &&
                  d.id === id
              );
              const latestDetail =
                filteredDetails.length > 0 ? filteredDetails[0] : null;
              return (
                <>
                  {/* Confirm deletion */}
                  {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                      <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="mb-4 text-lg">
                          This cannot be undone! Are you sure you want to
                          delete?
                        </p>
                        <button
                          onClick={() => handleDeleteClick(latestDetail.id)}
                          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 transition duration-200 mr-2"
                        >
                          Yes
                        </button>
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 transition duration-200"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Display appointment details */}
                  <div id="contentToPrint" className="p-4">
                    {latestDetail ? (
                      <>
                        {/* Clinic details */}
                        <div className="grid grid-cols-2">
                          <label className="block mb-2 text-2xl">
                            <span className="font-medium">Health Center</span>:
                            Selous Avenue Clinic
                          </label>
                          <label className="block mb-2 text-2xl">
                            <span className="font-medium">Date</span>:
                            {latestDetail.Date}
                          </label>
                          <label className="block mb-2 text-2xl">
                            <span className="font-medium">Email</span>:
                            selousavenueclinic@hotmail.com
                          </label>
                          <label className="block mb-2 text-2xl">
                            <span className="font-medium">Clinic Number</span>:
                            +263 774358471
                          </label>
                        </div>
                        {/* Patient's details */}
                        <div>
                          <h2 className="font-semibold my-2 text-lg ">
                            {patient.Name}
                          </h2>
                          <label className="block mb-2">
                            <span className="font-medium">Date of Birth</span>:{" "}
                            {patient.Dob}
                          </label>
                          <label className="block mb-2">
                            <span className="font-medium">Address</span>:{" "}
                            {patient.Address}
                          </label>
                        </div>
                        {/* Anthropometry Section */}
                        <div className="p-3 border-b border-gray-300">
                          <h2 className="text-xl text-blue-400">
                            Anthropometry
                          </h2>
                          <div className="grid grid-cols-2">
                            <label className="block mb-2">Weight:</label>
                            <span className="block mb-2">
                              {latestDetail.Weight}
                            </span>
                            <label className="block mb-2">Height:</label>
                            <span className="block mb-2">
                              {latestDetail.Height}
                            </span>
                            <label className="block mb-2">
                              Body Mass Index (BMI):
                            </label>
                            <span className="block mb-2">
                              {latestDetail.BMI ? latestDetail.BMI : 0}
                            </span>
                          </div>
                        </div>
                        {/* Presenting Complaints Section */}
                        <div
                          className={`p-3 border-b border-gray-300 ${
                            latestDetail.Subjective === "" &&
                            latestDetail.Objective === "" &&
                            latestDetail.Meds === "" &&
                            latestDetail.Allergies === "" &&
                            "hidden"
                          }`}
                        >
                          <h2 className="text-xl text-blue-400">
                            Presenting Complaints
                          </h2>
                          <div>
                            <div
                              className={`grid grid-cols-2 gap-4 ${
                                latestDetail.Subjective === "" && "hidden"
                              }`}
                            >
                              <label className="block font-medium border-r border-gray-300">
                                Subjective
                              </label>
                              <span className="block mb-2">
                                {latestDetail.Subjective}
                              </span>
                            </div>
                            <div
                              className={`grid grid-cols-2 gap-4 ${
                                latestDetail.Objective === "" && "hidden"
                              }`}
                            >
                              <label className="block font-medium border-r border-gray-300">
                                Past Medical History
                              </label>
                              <span className="block mb-2">
                                {latestDetail.Objective}
                              </span>
                            </div>
                            <div
                              className={`grid grid-cols-2 gap-4 ${
                                latestDetail.Meds === "" && "hidden"
                              }`}
                            >
                              <label className="block font-medium border-r border-gray-300">
                                Current Medications
                              </label>
                              <span className="block mb-2">
                                {latestDetail.Meds}
                              </span>
                            </div>
                            <div
                              className={`grid grid-cols-2 gap-4 ${
                                latestDetail.Allergies === "" && "hidden"
                              }`}
                            >
                              <label className="block font-medium border-r border-gray-300">
                                Allergies
                              </label>
                              <span className="block mb-2">
                                {latestDetail.Allergies}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Vital Signs Section */}
                        <div
                          className={`p-3 border-b border-gray-300 ${
                            latestDetail.Temperature === 0 &&
                            latestDetail.Systolic === 0 &&
                            latestDetail.Diastolic === 0 &&
                            latestDetail.Heart === 0 &&
                            latestDetail.Oxygen === 0 &&
                            "hidden"
                          }`}
                        >
                          <h2 className="text-xl text-blue-400">Vital Signs</h2>
                          <div>
                            <div
                              className={`flex gap-1 ${
                                latestDetail.Temperature === 0 && "hidden"
                              }`}
                            >
                              <label className="block mb-2">Temperature:</label>
                              <span className="block mb-2">
                                {latestDetail.Temperature}
                              </span>
                            </div>
                            <div
                              className={`flex gap-1 ${
                                latestDetail.Systolic === 0 && "hidden"
                              }`}
                            >
                              <label className="block mb-2">
                                Systolic Pressure:
                              </label>
                              <span className="block mb-2">
                                {latestDetail.Systolic}
                              </span>
                            </div>
                            <div
                              className={`flex gap-1 ${
                                latestDetail.Diastolic === 0 && "hidden"
                              }`}
                            >
                              <label className="block mb-2">
                                Diastolic Pressure:
                              </label>
                              <span className="block mb-2">
                                {latestDetail.Diastolic}
                              </span>
                            </div>
                            <div
                              className={`flex gap-1 ${
                                latestDetail.Heart === 0 && "hidden"
                              }`}
                            >
                              <label className="block mb-2">Heart Rate:</label>
                              <span className="block mb-2">
                                {latestDetail.Heart}
                              </span>
                            </div>
                            <div
                              className={`flex gap-1 ${
                                latestDetail.Oxygen === 0 && "hidden"
                              }`}
                            >
                              <label className="block mb-2">
                                Oxygen Saturation:
                              </label>
                              <span className="block mb-2">
                                {latestDetail.Oxygen}
                              </span>
                            </div>
                            <div
                              className={`flex gap-1 ${
                                latestDetail.RBS === 0 && "hidden"
                              }`}
                            >
                              <label className="block mb-2">RBS:</label>
                              <span className="block mb-2">
                                {latestDetail.RBS}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Physical Exam Section */}
                        <div
                          className={`p-3 border-b border-gray-300 ${
                            latestDetail.Probs == "" && "hidden"
                          }`}
                        >
                          <h2 className="text-xl text-blue-400">
                            Physical Exam
                          </h2>
                          <div className="grid grid-cols-2 gap-4">
                            <label className="block font-medium border-r border-gray-300">
                              Findings
                            </label>
                            <span className="block mb-2">
                              {typeof latestDetail.Probs === "string"
                                ? latestDetail.Probs
                                : latestDetail.Probs.map((line, index) => (
                                    <span key={index}>
                                      {line}
                                      <br />
                                    </span>
                                  ))}
                            </span>
                          </div>
                        </div>
                        {/* Diagnosis Section */}
                        <div className="p-3 border-b border-gray-300">
                          <h2 className="text-xl text-blue-400">Diagnosis</h2>
                          <label className="block mb-2 font-medium">
                            Diagnosis
                          </label>
                          <span className="block mb-2">
                            {latestDetail.Diagnosis}
                          </span>
                          <div
                            className={`${
                              latestDetail.Differential === "" && "hidden"
                            }`}
                          >
                            <label className="block mb-2 font-medium">
                              Differential Diagnosis
                            </label>
                            <span className="block mb-2">
                              {latestDetail.Differential}
                            </span>
                          </div>
                          <div
                            className={`${
                              latestDetail.Treatment == "" && "hidden"
                            }`}
                          >
                            <label className="block my-2 text-xl text-blue-400">
                              Plan
                            </label>
                            <span className="block mb-2">
                              {typeof latestDetail.Treatment === "string"
                                ? latestDetail.Treatment
                                : latestDetail.Treatment.map((line, index) => (
                                    <span key={index}>
                                      {line}
                                      <br />
                                    </span>
                                  ))}
                            </span>
                          </div>
                          <div
                            className={`${
                              latestDetail.Injected == "" && "hidden"
                            }`}
                          >
                            <label className="block mb-2 font-medium">
                              Injections
                            </label>
                            <span className="block mb-2">
                              {latestDetail.Injected
                                ? latestDetail.Injected.map((injection) => (
                                    <span key={injection.id}>
                                      {injection.name}
                                      <br />
                                    </span>
                                  ))
                                : ""}
                            </span>
                          </div>
                        </div>
                        {/* Extra Info Section */}
                        <div
                          className={`p-3 border-b border-gray-300 ${
                            latestDetail.Extra === "" && "hidden"
                          }`}
                        >
                          <h2 className="text-xl text-blue-400">Extra Info</h2>
                          <span className="block mb-2">
                            {latestDetail.Extra}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div>No appointment details available.</div>
                    )}
                  </div>
                  {/* Buttons */}
                  <div className="flex justify-center gap-8">
                    <button
                      className="mt-4 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 transition duration-200"
                      onClick={generatePDF}
                    >
                      Print
                    </button>
                    <button
                      className="mt-4 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 transition duration-200"
                      onClick={handleEditClick}
                    >
                      Edit
                    </button>
                    <button
                      className="mt-4 p-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 transition duration-200"
                      onClick={() => showAlert()}
                    >
                      Delete
                    </button>
                    <button
                      className="mt-4 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 transition duration-200"
                      onClick={() => closeApp()}
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Notification</h2>
            <p className="mb-6">{modalMessage}</p>
            <button
              onClick={closeModalS}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Appointments;
