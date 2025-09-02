import React, { useState, useEffect } from "react";
import Patients from "./Patients";
import { Globals } from "../Globals.js";
import Login from "./Login.jsx";
import Navbar from "./Navbar.jsx";
import Appointments from "./Appointments.jsx";
import Summary from "./Summary.jsx";
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
import Attachments from "./Attachments.jsx";
import Totals from "./Totals.jsx";
import logo from "./assets/Selous.jpeg";
import Stock from "./Stock.jsx";
import Settings from "./Settings.jsx";
import LocSummary from "./LocSummary.jsx";
import { AiOutlineClose } from "react-icons/ai";

const App = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [blood, setBlood] = useState("");
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [marital, setMarital] = useState("");
  const [refer, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [aid, setAid] = useState("");
  const [editPatient, setEditPatient] = useState(false);
  const [createPatient, setCreatePatient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [logged, setLogged] = useState(false);
  const [history, setHistory] = useState("");
  const [critical, setCritical] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [details, setDetails] = useState([]);
  const [activeComponent, setActiveComponent] = useState("Patients");
  const [admin, setAdmin] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [aidNum, setAidNum] = useState("");
  const [medicalAids, setMedicalAids] = useState([]);
  const [openFull, setOpenFull] = useState(false);
  const [id, setId] = useState(null);
  const [openApp, setOpenApp] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [patient, setPatient] = useState({});
  const [i, setI] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [injections, setInjections] = useState([]);
  const [injected, setInjected] = useState([]);
  const [locum, setLocum] = useState(() => {
    const savedLocum = localStorage.getItem("locum");
    return savedLocum || "";
  });
  const [totals, setTotals] = useState([]);
  const [newAid, setNewAid] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [logs, setLogs] = useState([]);

  //signs tab
  const [temperature, setTemperature] = useState(0);
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [heart, setHeart] = useState(0);
  const [oxygen, setOxygen] = useState(0);
  const [weigh, setWeigh] = useState(0);
  const [high, setHigh] = useState(0);
  const [bmi, setBmi] = useState(0);
  const [rbs, setRbs] = useState(0);
  //Extra info
  const [extra, setExtra] = useState("");
  //Physical Exam
  const [allergies, setAllergies] = useState("");
  const [meds, setMeds] = useState("");
  const [probs, setProbs] = useState("");
  //SOAP Notes
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  //Diagnosis
  const [diagnosis, setDiagnosis] = useState("");
  const [diffDiagnosis, setDiffDiagnosis] = useState("");
  const [treatPlan, setTreatPlan] = useState("");
  const [diagnosisSuggest, setDiagnosisSuggest] = useState([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [newSuggest, setNewSuggest] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [suggestionSelected, setSuggestionSelected] = useState(false);

  const [menu, setMenu] = useState(false);
  const deskNav = [
    "Patients",
    "Appointments",
    "Locums",
    "Summary",
    "Attachments",
    "Totals",
    "Stock",
    "Settings",
  ];

  //Choose page to display
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "Patients":
        return <Patients />;
      case "Appointments":
        return <Appointments />;
      case "Locums":
        return <LocSummary />;
      case "Summary":
        return <Summary />;
      case "Attachments":
        return <Attachments />;
      case "Totals":
        return <Totals />;
      case "Stock":
        return <Stock />;
      case "Settings":
        return <Settings />;
      default:
        return <Patients />;
    }
  };
  // Real-time listener for calendar
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "CalendarApp"),
      (snapshot) => {
        const appointmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(appointmentsData);
      }
    );
    return () => unsubscribe();
  }, []);
  // Real-time listener for injections
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Injections"), (snapshot) => {
      const injectData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInjections(injectData);
    });
    return () => unsubscribe();
  }, []);
  // Real-time listener for medical aids
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "MedicalAids"),
      (snapshot) => {
        const aidData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedicalAids(aidData);
      }
    );
    return () => unsubscribe();
  }, []);
  // Real-time listener for attachments
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Attachments"),
      (snapshot) => {
        const attachmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttachments(attachmentsData);
      }
    );
    return () => unsubscribe();
  }, []);
  // Real-time listener for Appointments
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Appointments"),
      (snapshot) => {
        const appointmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDetails(appointmentsData);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
  // Real-time listener for Patients
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Patients"), (snapshot) => {
      const patientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patientsData);
    });
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
  //keep page on refresh
  const setViewAndSave = (newView) => {
    setActiveComponent(newView);
    localStorage.setItem("currentView", newView);
  };
  //recover open page
  useEffect(() => {
    const savedView = localStorage.getItem("currentView");
    if (savedView) {
      setActiveComponent(savedView);
    }
  }, []);
  //add patient to database
  const handleCreatePatient = async () => {
    setLoading(true);
    try {
      const dateKey = new Date().toISOString();
      await addDoc(collection(db, "Patients"), {
        Date: dateKey,
        Name: name,
        Dob: dob,
        Sex: sex,
        BloodGroup: blood,
        Height: height,
        Weight: weight,
        Marital: marital,
        Ref: refer,
        Phone: phone,
        Email: email,
        Address: address,
        MedicalAid: aid,
        MedicalAidNumber: aidNum,
        Critical: critical,
        History: history,
      });
    } catch (error) {
      setLoading(false);
    } finally {
      setSuccessMessage("Patient Added Successfully");
      resetForm();
      setLoading(false);
    }
  };
  //clear input fields
  function resetForm() {
    setName("");
    setDob("");
    setSex("");
    setBlood("");
    setHeight(0);
    setWeight(0);
    setMarital("");
    setRef("");
    setPhone("");
    setEmail("");
    setAddress("");
    setAid("");
    setCritical("");
    setHistory("");
    setAidNum("");
  }
  //real-time listener for totals
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Totals"),
      (snapshot) => {
        const fetchedTotals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTotals(fetchedTotals);
      },
      (error) => {
        console.error("Error fetching totals: ", error);
      }
    );
    return () => unsubscribe();
  }, []);
  //real-time listener for doctors
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Doctors"),
      (snapshot) => {
        const fetchedDoctors = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(fetchedDoctors);
      },
      (error) => {
        console.error("Error fetching totals: ", error);
      }
    );
    return () => unsubscribe();
  }, []);
  //real-time listener for logs
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Logs"),
      (snapshot) => {
        const fetchedLogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogs(fetchedLogs);
      },
      (error) => {
        console.error("Error fetching logs: ", error);
      }
    );
    return () => unsubscribe();
  }, []);
  //display mobile menu

  return (
    <Globals.Provider
      value={{
        rbs,
        setRbs,
        successMessage,
        setSuccessMessage,
        logs,
        menu,
        setMenu,
        setLogs,
        doctors,
        setDoctors,
        patients,
        setPatients,
        name,
        setName,
        dob,
        setDob,
        sex,
        setSex,
        blood,
        setBlood,
        height,
        setHeight,
        weight,
        setWeight,
        marital,
        setMarital,
        refer,
        setRef,
        phone,
        setPhone,
        email,
        setEmail,
        address,
        setAddress,
        aid,
        setAid,
        editPatient,
        setEditPatient,
        createPatient,
        setCreatePatient,
        resetForm,
        loading,
        setLoading,
        user,
        setUser,
        logged,
        setLogged,
        history,
        setHistory,
        critical,
        setCritical,
        appointments,
        setAppointments,
        details,
        setDetails,
        handleCreatePatient,
        admin,
        setAdmin,
        attachments,
        setAttachments,
        aidNum,
        setAidNum,
        medicalAids,
        setMedicalAids,
        openFull,
        setOpenFull,
        id,
        setId,
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
        openApp,
        setOpenApp,
        openEdit,
        setOpenEdit,
        injections,
        setInjections,
        injected,
        setInjected,
        locum,
        setLocum,
        totals,
        setTotals,
        newAid,
        setNewAid,
      }}
    >
      <div className={`flex min-h-screen`}>
        {logged ? (
          <>
            <div
              className={
                "w-1/6 bg-blue-800 hidden lg:block border-r p-2 fixed h-full"
              }
            >
              <ul className="space-y-2">
                <li>
                  <img src={logo} alt="logo" className="rounded" />
                </li>
                {deskNav.map((item, index) => (
                  <li key={index}>
                    <button
                      className={`w-full flex justify-between text-left text-white p-2 border-b border-blue-700 ${
                        activeComponent === item
                          ? "bg-blue-700"
                          : "hover:bg-blue-600"
                      }
                    ${
                      (item === "Totals" ||
                        item === "Stock" ||
                        item === "Settings" ||
                        item === "Summary") &&
                      locum &&
                      "hidden"
                    }`}
                      onClick={() => setViewAndSave(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {menu && (
              <div className="fixed right-0 z-20 bg-blue-800 w-full p-8 flex flex-col lg:hidden">
                <div
                  className="flex justify-end top-0 my-2"
                  onClick={() => setMenu(false)}
                >
                  <AiOutlineClose size={20} />
                </div>
                <ul className="">
                  <li className="my-2">
                    <img
                      src={logo}
                      alt="logo"
                      className="rounded w-full h-24"
                    />
                  </li>
                  {deskNav.map((item, index) => (
                    <li key={index}>
                      <button
                        className={`w-full flex justify-between text-left text-white p-2 border-b border-blue-700 ${
                          activeComponent === item
                            ? "bg-blue-700"
                            : "hover:bg-blue-600"
                        }
                    ${
                      (item === "Totals" ||
                        item === "Stock" ||
                        item === "Settings" ||
                        item === "Summary") &&
                      locum &&
                      "hidden"
                    }`}
                        onClick={() => setViewAndSave(item)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex-1 lg:ml-[16.6666667%]">
              <span className="fixed w-full">
                <Navbar />
              </span>
              <div className="lg:mt-16 mt-16">{renderActiveComponent()}</div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Login />
          </div>
        )}
      </div>
    </Globals.Provider>
  );
};

export default App;
