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

const AddAid = () => {
  const { setNewAid } = useContext(Globals);
  const [aidName, setAidName] = useState("");

  //add medical aid to database
  const handleSaveClick = async (aidName) => {
    if (!aidName) return;
    try {
      const newMed = { Medical: aidName };
      await addDoc(collection(db, "MedicalAids"), newMed);
      setAidName("");
    } catch (error) {
      console.error("Error creating medical aid: ", error);
    }
  };
  return (
    <div>
      <div className="max-w-md bg-white p-8 absolute">
        <input
          type="text"
          placeholder="Medical Aid"
          value={aidName}
          onChange={(e) => setAidName(e.target.value)}
          className="border p-3"
        />
        <div>
          <button
            className="bButton"
            onClick={() => handleSaveClick(aidName)}
          >
            Save
          </button>
          <button
            className={
              "gButton"
            }
            onClick={() => setNewAid(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAid;
