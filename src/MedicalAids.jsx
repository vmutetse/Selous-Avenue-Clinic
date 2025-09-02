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
import AddAid from "./AddAid";

const MedicalAids = () => {
  const { medicalAids, setNewAid, newAid } = useContext(Globals);

  //delete medical aids
  const deleteAid = async (identity) => {
    await deleteDoc(doc(db, "MedicalAids", identity));
  };
  return (
    <div>
      {newAid && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md">
            <AddAid />
          </div>
        </div>
      )}
      <div className={` ${newAid ? "opacity-50" : ""}`}>
        <h3 className="text-2xl font-bold mb-4">Medical Aids</h3>
        <button
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setNewAid(true)}
        >
          Add New
        </button>
        {medicalAids
          .sort((a, b) => a.Medical.localeCompare(b.Medical))
          .map((aid) => (
            <div
              key={aid.id}
              className="flex justify-between bg-gray-100 cursor-pointer hover:bg-gray-50 border-b p-2 mb-2 rounded"
            >
              <span>{aid.Medical}</span>
              <button
                onClick={() => deleteAid(aid.id)}
                className="text-red-600 hover:underline"
              >
                delete
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MedicalAids;
