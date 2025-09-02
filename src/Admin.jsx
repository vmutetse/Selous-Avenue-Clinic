import { useContext, useState, useEffect } from "react";
import { db } from "../firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { Globals } from "../Globals.js";
import Success from "./Success.jsx";

const Admin = () => {
  const { admin, setSuccessMessage, successMessage } = useContext(Globals);

  const [newID, setNewID] = useState(admin[0].user);
  const [newPassword, setNewPassword] = useState("");
  const [cNewPassword, setCNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState(true);

  const handleUpdate = async (index) => {
    setLoading(true);
    const docRef = doc(db, "Admin", admin[index].id);
    try {
      await updateDoc(docRef, {
        Username: newID,
        Password: newPassword,
      });
      
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
      setSuccessMessage("Details updated!");
      setNewPassword("");
      setNewID("");
      setCNewPassword("");
    }
  };
  useEffect(() => {
    if (cNewPassword !== newPassword) {
      setMatch(false);
    } else {
      setMatch(true);
    }
  }, [cNewPassword]);
  return (
    <div>
      <div
        className={
          successMessage
            ? "bg-gray-50 min-h-screen opacity-50"
            : "bg-gray-50 min-h-screen"
        }
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-md w-80">
            <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">
              Edit Admin Details
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                New Admin ID
              </label>
              <input
                value={newID}
                onChange={(e) => setNewID(e.target.value)}
                type="text"
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="mb-6">
              {match ? (
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
              ) : (
                <label className="block text-sm font-medium underline text-red-600">
                  Passwords do not match
                </label>
              )}
              <input
                value={cNewPassword}
                onChange={(e) => setCNewPassword(e.target.value)}
                type="password"
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              onClick={() => handleUpdate(0)}
              disabled={loading || !match}
              className={`bg-blue-500 text-white p-3 rounded-md font-medium hover:bg-blue-600 transition duration-200 ${
                loading || !match ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Success Message */}
      {successMessage && <Success />}
    </div>
  );
};

export default Admin;
