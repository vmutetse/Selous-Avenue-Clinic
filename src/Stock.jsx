import React, { useContext, useState, useEffect } from "react";
import { Globals } from "../Globals.js";
import { db } from "../firebase.js";
import {
  doc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

const Stock = () => {
  const { injections, setInjections } = useContext(Globals);
  const [injectionName, setInjectionName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [newInjection, setNewInjection] = useState(false);
  const [editInjection, setEditInjection] = useState(false);
  const [id, setId] = useState(null);
  //add injections to database
  const handleSaveClick = async (injection) => {
    if (!injection) return;
    try {
      const newInj = { name: injection, quantity: quantity };
      await addDoc(collection(db, "Injections"), newInj);
    } catch (error) {
      console.error("Error entering injection: ", error);
    } finally {
      setInjectionName("");
      setQuantity(0);
    }
  };
  //close new injection page
  function handleDoneClick() {
    setNewInjection(false);
    setEditInjection(false);
    setId(null);
  }
  // Edit quantity
  function handleEditClick(id1) {
    const selectedInjection = injections.find(
      (injection) => injection.id === id1
    );

    if (selectedInjection) {
      setInjectionName(selectedInjection.name);
      setQuantity(selectedInjection.quantity);
      setId(id1);
      setEditInjection(true);
    }
  }
  //Edit quantity in database
  const handleUpdate = async () => {
    if (!injectionName) {
      return;
    }
    const docRef = doc(db, "Injections", id);
    try {
      await updateDoc(docRef, {
        name: injectionName,
        quantity: quantity,
      });
    } catch (error) {
      console.error("Error updating quantity: ", error);
    } finally {
      setInjectionName("");
      setQuantity(0);
    }
  };
  //injection page
  const addInjection = (heading, function1) => {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className=" bg-white p-8 absolute max-w-lg">
          <h4 className="text-xl font-medium mb-4 bg-gray-100 text-center shadow-md p-2 rounded-md">
            {heading}
          </h4>
          <div>
            <label className="block mb-2 font-bold">Injection</label>
            <input
              type="text"
              placeholder="Injection Name"
              value={injectionName}
              onChange={(e) => setInjectionName(e.target.value)}
              className="border p-3"
            />
          </div>
          <div>
            <label className="block mb-2 font-bold">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border p-3"
            />
          </div>
          <div>
            <button
              className="mt-4 w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
              onClick={() => function1(injectionName)}
            >
              Save
            </button>
            <button
              className={
                "mt-4 p-2 rounded bg-green-700 text-white hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-300"
              }
              onClick={() => handleDoneClick()}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=" min-h-screen overflow-auto h-auto bg-gray-100 p-4">
      <button
        className={`mt-4 p-2 rounded  text-white ${
          newInjection
            ? " hidden"
            : " bg-green-600 hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
        }`}
        onClick={() => setNewInjection(true)}
      >
        Add New Injection
      </button>
      {newInjection && addInjection("Add Injection", handleSaveClick)}
      {editInjection && addInjection("Edit Injection", handleUpdate)}
      <div>
        {injections.length > 0 && (
          <table className="min-w-full bg-white border border-gray-300 mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b p-4 text-left">Injection</th>
                <th className="border-b p-4 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {injections
                .sort((a, b) => Number(a.quantity) - Number(b.quantity))
                .map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100"
                    onClick={() => handleEditClick(item.id)}
                  >
                    <td className="border-b p-4">{item.name}</td>
                    <td className="border-b p-4">{item.quantity}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Stock;
