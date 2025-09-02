import React, { useContext, useEffect, useState } from "react";
import { db, storage } from "../firebase.js";
import { Globals } from "../Globals.js";
import {
  doc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PatientForm from "./PatientForm.jsx";
import Success from "./Success.jsx";

const Patients = () => {
  const {
    patients,
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
    successMessage,
    setSuccessMessage,
    history,
    critical,
    handleCreatePatient,
    attachments,
    aidNum,
    setAidNum,
    locum,
  } = useContext(Globals);

  const [viewPatient, setViewPatient] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [i, setI] = useState(null);
  const [openAttach, setOpenAttach] = useState(false);
  const [imageFile, setImageFile] = useState("");
  const [file, setFile] = useState(null);

  //Edit Patient in database
  const handleUpdate = async (index) => {
    setLoading(true);
    const docRef = doc(db, "Patients", patients[index].id);

    try {
      await updateDoc(docRef, {
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
        BMI: weight / (height * height),
      });
      setSuccessMessage("Patient updated!");
      resetForm();
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };
  //delete patient from database
  const deletePatient = async (filteredIndex) => {
    const patientToDelete = filteredPatients[filteredIndex];

    if (patientToDelete) {
      const originalIndex = patients.findIndex(
        (p) => p.id === patientToDelete.id
      );

      if (originalIndex !== -1) {
        await deleteDoc(doc(db, "Patients", patients[originalIndex].id));
      } else {
        console.error("Original patient not found.");
      }
    }
  };
  //delete attachment
  const deleteAttachment = async (identity) => {
    await deleteDoc(doc(db, "Attachments", identity));
  };
  //open full ptient details
  function handleNameClick(filteredIndex) {
    const patient = filteredPatients[filteredIndex];
    const originalIndex = patients.findIndex((p) => p.id === patient.id);
    setI(originalIndex);
    setViewPatient(true);
  }
  //open edit page with patient details
  function handleEditClick(filteredIndex) {
    const patient = filteredPatients[filteredIndex];
    const originalIndex = patients.findIndex((p) => p.id === patient.id);

    if (originalIndex !== -1) {
      setName(patients[originalIndex].Name);
      setDob(patients[originalIndex].Dob);
      setSex(patients[originalIndex].Sex);
      setBlood(patients[originalIndex].BloodGroup);
      setHeight(patients[originalIndex].Height);
      setWeight(patients[originalIndex].Weight);
      setMarital(patients[originalIndex].Marital);
      setRef(patients[originalIndex].Ref);
      setPhone(patients[originalIndex].Phone);
      setEmail(patients[originalIndex].Email);
      setAddress(patients[originalIndex].Address);
      setAid(patients[originalIndex].MedicalAid);
      setAidNum(patients[originalIndex].MedicalAidNumber);
      setI(originalIndex);
      setEditPatient(true);
    } else {
      console.error("Patient not found in the original list.");
    }
  }
  //close patient view
  function handleClosePatientClick() {
    setViewPatient(false);
    setI(null);
  }
  //close edit page
  function handleClosePatClick() {
    setEditPatient(false);
    resetForm();
    setI(null);
  }
  //close create patient
  function handleCloseClick() {
    setCreatePatient(false);
  }

  //filter by name
  const filteredPatients = patients.filter((patient) =>
    patient.Name.toLowerCase().includes(searchName.toLowerCase())
  );
  //attachment
  const handleImageFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageFile(selectedFile.name);
      setFile(selectedFile);
    } else {
      setImageFile("");
      setFile(null);
    }
  };

  const handleImageUpload = async () => {
    if (!file) {
      // Check the 'file' variable instead of 'imageFile' string
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `Attachments/${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      const dateKey = new Date().toISOString();

      // Add document to Firestore
      await addDoc(collection(db, "Attachments"), {
        name: patients[i]?.name || "Unknown Patient", // Optional chaining
        fileName: file.name,
        url: downloadURL,
        date: dateKey,
        fileType: file.type, // Store the file type (image/pdf)
      });
      setImageFile(""); // Clear the imageFile state
      setFile(null); // Clear the file state
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-300">
      {editPatient && (
        <PatientForm
          text="Edit Patient"
          fxn1={() => handleUpdate(i)}
          fxn2={handleClosePatClick}
        />
      )}
      {createPatient && (
        <PatientForm
          text="Add Patient"
          fxn1={handleCreatePatient}
          fxn2={handleCloseClick}
        />
      )}

      <div className={createPatient || editPatient ? "hidden" : ""}>
        {/* Create New Patient Button */}
        <div className={`flex justify-center mt-4 pt-4`}>
          <button
            className={`p-2 rounded bg-green-700 text-white hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-300 ${
              locum && "hidden"
            }`}
            onClick={() => setCreatePatient(true)}
          >
            Create New Patient
          </button>
        </div>

        {/* Success Message */}
        <div className="z-10">{successMessage && <Success />}</div>

        {/* Patients List */}
        <div
          className={`overflow-x-auto  ${
            successMessage || (viewPatient && "hidden")
          }`}
        >
          <h2 className="text-lg p-2 lg:text-2xl font-semibold lg:p-4 flex justify-center">
            Patients
          </h2>
          <div className="flex justify-center mb-4">
            <input
              type="text"
              placeholder="Search by patient's name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border border-gray-300 rounded p-2 w-1/3"
            />
          </div>

          <table className="min-w-full bg-white text-sm lg:text-base border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left">
                  Name
                </th>
                <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left hidden lg:table-cell">
                  Sex
                </th>
                <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left hidden lg:table-cell">
                  Date of Birth
                </th>
                <th className="py-1 px-2 lg:py-2 lg:px-4 border-b text-left">
                  Age
                </th>
                <th
                  className={`py-1 px-2 md:py-2 md:px-4 border-b text-left ${
                    locum && "hidden"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients
                .sort((a, b) => a.Name.localeCompare(b.Name))
                .map((patient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td
                      className="py-1 px-2 lg:py-2 lg:px-4 border-b cursor-pointer"
                      onClick={() => handleNameClick(index)}
                    >
                      {patient.Name}
                    </td>
                    <td className="py-1 px-2 lg:py-2 lg:px-4 border-b hidden lg:table-cell">
                      {patient.Sex}
                    </td>
                    <td className="py-1 px-2 lg:py-2 lg:px-4 border-b hidden lg:table-cell">
                      {patient.Dob}
                    </td>
                    <td className="py-1 px-2 lg:py-2 lg:px-4 border-b">
                      {(() => {
                        const dob = new Date(patient.Dob);
                        const today = new Date();
                        let age = today.getFullYear() - dob.getFullYear();
                        const monthDifference =
                          today.getMonth() - dob.getMonth();

                        if (
                          monthDifference < 0 ||
                          (monthDifference === 0 &&
                            today.getDate() < dob.getDate())
                        ) {
                          age--;
                        }
                        return age ? age : "--";
                      })()}
                    </td>
                    <td
                      className={`py-2 px-4 border-b space-x-2 ${
                        locum && "hidden"
                      }`}
                    >
                      <button
                        onClick={() => deletePatient(index)}
                        className="p-1 rounded-md font-medium border border-black"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditClick(index)}
                        className="p-1 rounded-md font-medium border border-black"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* View Full Patient Details */}
        {viewPatient && (
          <div
            className={`bg-gray-100 min-h-screen flex items-center justify-center absolute p-1 inset-0`}
          >
            <div className="bg-white p-6 lg:p-6 rounded-lg shadow-lg w-full">
              <h2 className="text-2xl font-semibold mb-4">Patient Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className="block mb-2">
                  Patient's Name: {patients[i].Name}
                </label>
                <label className="block mb-2">
                  Date of Birth: {patients[i].Dob}
                </label>
                <label className="block mb-2">Gender: {patients[i].Sex}</label>
                <label className="block mb-2">
                  Blood Group: {patients[i].BloodGroup}
                </label>
                <label className="block mb-2">
                  Height: {patients[i].Height}
                </label>
                <label className="block mb-2">
                  Weight: {patients[i].Weight}
                </label>
                <label className="block mb-2">
                  Marital Status: {patients[i].Marital}
                </label>
                <label className="block mb-2">
                  Referred by: {patients[i].Ref}
                </label>
                <label className="block mb-2">Phone: {patients[i].Phone}</label>
                <label className="block mb-2">Email: {patients[i].Email}</label>
                <label className="block mb-2">
                  Address: {patients[i].Address}
                </label>
                <label className="block mb-2">
                  Medical Aid: {patients[i].MedicalAid}
                </label>
                <label className="block mb-2">
                  Medical Aid Number: {patients[i].MedicalAidNumber}
                </label>
              </div>

              {/* View Attachments */}
              {attachments.filter((test) => test.name === patients[i].Name)
                .length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold my-4">Attachments</h3>
                  <ul className="mt-2 list-none">
                    {attachments
                      .filter((test) => test.name === patients[i].Name)
                      .map((test) => (
                        <li
                          key={test.id}
                          className="flex justify-between items-center p-2 border-b border-gray-200"
                        >
                          <a
                            href={test.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {test.fileName}
                          </a>
                          <span className="text-gray-500 text-sm">
                            {new Date(test.date).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => deleteAttachment(test.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mb-4">
                <button
                  className={`mt-4 p-2 rounded ${
                    openAttach ? "bg-green-700" : "bg-blue-700"
                  } text-white hover:${
                    openAttach ? "bg-green-800" : "bg-blue-800"
                  } focus:outline-none focus:ring focus:ring-${
                    openAttach ? "green" : "blue"
                  }-300`}
                  onClick={() => setOpenAttach(!openAttach)}
                >
                  {openAttach ? "Done" : "Attachment"}
                </button>
                <button
                  className="mt-4 p-2 rounded bg-blue-700 text-white hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300"
                  onClick={handleClosePatientClick}
                >
                  Close
                </button>
              </div>

              {/* Add Attachment */}
              {openAttach && (
                <div className="mx-auto p-4 border border-gray-300 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold mb-4">Upload File</h2>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleImageFileChange}
                    className="block w-full mb-4 border border-gray-300 rounded-lg p-2"
                  />
                  <button
                    onClick={handleImageUpload}
                    disabled={loading}
                    className={`mt-4 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? <span>Uploading...</span> : "Upload File"}
                  </button>
                  {imageFile && (
                    <div className="mt-2 text-gray-700">
                      Selected file: <strong>{imageFile}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
