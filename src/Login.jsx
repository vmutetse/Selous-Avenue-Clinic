import React, { useContext, useState, useEffect } from "react";
import { Globals } from "../Globals";
import { db } from "../firebase.js";
import { getDocs, collection } from "firebase/firestore";

const Login = () => {
  const { user, setUser, setLogged, admin, setAdmin } = useContext(Globals);

  const [pass, setPass] = useState("");
  const [isPass, setIsPass] = useState(true);

  //local storage (keep user logged in)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    setUser(savedUser);
    let found = false;

    found = admin.some((admin1) => {
      if (admin1.user === savedUser) {
        setLogged(true);
        return true;
      }
      return false;
    });
  }, [admin]);
  //Validate user
  function handleLogin() {
    const trimmedUser = user.trim();
    let found = false;
    admin.forEach((admin1) => {
      if (admin1.user === trimmedUser) {
        found = true;
        if (admin1.password === pass) {
          setIsPass(true);
          setLogged(true);
          localStorage.setItem("user", trimmedUser);
        } else {
          setIsPass(false);
          setPass("");
          setLogged(false);
        }
      }
    });
    if (!found) {
      alert("User not found");
    }
  }

  //get user details
  const getAdmin = async () => {
    try {
      const adminSnapshot = await getDocs(collection(db, "Admin"));
      const adminList = adminSnapshot.docs.map((doc) => ({
        id: doc.id,
        user: doc.data().Username.trim(),
        password: doc.data().Password,
      }));

      setAdmin(adminList);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);
  return (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-100 p-6 rounded shadow-md w-80">
          <h2 className="text-center text-2xl mb-4">Login</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              type="text"
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="mb-6">
            {isPass ? (
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
            ) : (
              <label className="block text-sm font-medium underline text-red-600">
                *Enter valid password
              </label>
            )}
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type="password"
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-700 text-white p-2 rounded hover:bg-blue-800 ${
              pass?.length === 0 || user?.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={pass?.length === 0 || user?.length === 0}
            onClick={() => handleLogin()}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
