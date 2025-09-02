import React, { useContext } from "react";
import { Globals } from "../Globals";

const Success = () => {
  const { successMessage, setSuccessMessage } = useContext(Globals);
  return (
    <div>
      <div className="flex items-center justify-center fixed inset-0">
        <div className="shadow-xl flex flex-col p-4 my-4 rounded-lg bg-white">
          <p className="text-blue-500 text-xl font-semibold text-center p-6 rounded-md">
            {successMessage}
          </p>
          <button
            onClick={() => setSuccessMessage("")}
            className="bg-blue-700 hover:bg-blue-800 p-1 rounded-md"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
