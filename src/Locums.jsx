import React, { useContext, useState } from "react";
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
const Locums = () => {
  const { doctors } = useContext(Globals);
  const [docName, setDocName] = useState("");
  const [newDoctor, setNewDoctor] = useState(false);

  //delete doctor
  const deleteDoctor = async (identity) => {
    await deleteDoc(doc(db, "Doctors", identity));
  };
  //add Doctor to database
  const handleSaveClick = async (docName) => {
    if (!docName) return;
    try {
      const newDoc = { Name: docName };
      await addDoc(collection(db, "Doctors"), newDoc);
      setDocName("");
    } catch (error) {
      console.error("Error adding doctor: ", error);
    }
  };

  return (
    <div>
      <div className={`${newDoctor ? "opacity-50" : "opacity-100"}`}>
        <h3 className="text-2xl font-bold mb-4">Locum Doctors</h3>
        <div>
            <button
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setNewDoctor(true)}
        >
          Add New
        </button>
          {doctors
            .sort((a, b) => a.Name.localeCompare(b.Name))
            .map((doctor) => (
              <div
                key={doctor.id}
                className="flex justify-between items-center mb-2 p-2 hover:bg-gray-50 border-b cursor-pointer bg-gray-100 rounded"
              >
                <span>{doctor.Name}</span>
                <button
                  onClick={() => deleteDoctor(doctor.id)}
                  className="text-red-500 hover:underline"
                >
                  delete
                </button>
              </div>
            ))}
        </div>
      </div>
      {newDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Doctor</h2>
            <input
              type="text"
              placeholder="Doctor's name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded mb-4"
            />
            <div>
              <button
                className="mt-2 w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                onClick={() => handleSaveClick(docName)}
              >
                Save
              </button>
              <button
                className="mt-2 w-full p-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
                onClick={() => setNewDoctor(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locums;
