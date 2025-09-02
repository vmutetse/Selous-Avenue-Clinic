import { useContext } from "react";
import { Globals } from "../Globals.js";
import Success from "./Success.jsx";
import AddAid from "./AddAid.jsx";

const PatientForm = (prop) => {
  const {
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
    loading,
    successMessage,
    aidNum,
    setAidNum,
    medicalAids,
    setNewAid,
    newAid,
  } = useContext(Globals);

  return (
    <div className="flex items-center justify-center min-h-screen overflow-auto h-auto bg-gray-100">
      <div className="z-10">{successMessage && <Success />}</div>

      {newAid && (
        <div className="max-w-md bg-white p-8 absolute z-10 flex items-center">
          <AddAid />
        </div>
      )}

      {/*Patient Data */}
      <div
        className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md ${
          successMessage || newAid ? "opacity-50" : ""
        }`}
      >
        <h2 className="text-2xl mt-1 font-semibold mb-4">{prop.text}</h2>
        <label className="block mb-2">
          Patient's Name
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
          />
        </label>
        <div className="grid grid-cols-2 gap-1">
          <label className="block mb-2">
            Date of Birth
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            />
          </label>
          <label className="block mb-2">
            Gender
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="block mb-2">
            Blood Group
            <select
              value={blood}
              onChange={(e) => setBlood(e.target.value)}
              className="mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            >
              <option value="">Blood Group</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </label>
          <label className="block mb-2">
            Marital Status
            <select
              value={marital}
              onChange={(e) => setMarital(e.target.value)}
              className="mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            >
              <option value="">Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          </label>
          <label className="block mb-2">
            Height
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1 w-3/4 block p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            />
          </label>
          <label className="block mb-2">
            Weight
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 block p-2 w-3/4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            />
          </label>
        </div>
        <label className="block mb-2">
          Referred by
          <input
            type="text"
            value={refer}
            onChange={(e) => setRef(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
          />
        </label>
        <label className="block mb-2">
          Phone
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
          />
        </label>
        <label className="block mb-2">
          Email
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
          />
        </label>
        <label className="block mb-2">
          Address
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
          />
        </label>
        <div>
          <label className="block mb-2">
            Medical Aid
            <select
              value={aid}
              onChange={(e) => setAid(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            >
              <option value="">Medical Aid</option>
              {medicalAids
                .sort((a, b) => {
                  return a.Medical.localeCompare(b.Medical);
                })
                .map((aid, index) => (
                  <option key={index} value={aid.Medical}>
                    {aid.Medical}
                  </option>
                ))}
            </select>
            <button
              onClick={() => setNewAid(true)}
              className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              New...
            </button>
          </label>
          <label className="block mb-2">
            Medical Aid Number
            <input
              type="text"
              placeholder="Aid No."
              value={aidNum}
              onChange={(e) => setAidNum(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-navy-500"
            />
          </label>
        </div>
        <button
          onClick={prop.fxn1}
          disabled={loading}
          className={`mt-4 w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? <span>Saving...</span> : "Save"}
        </button>
        <button
          className="mt-4 w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          onClick={prop.fxn2}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PatientForm;
