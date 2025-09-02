import React, { useState } from "react";
import MedicalAids from "./MedicalAids";
import Admin from "./Admin";
import Locums from "./Locums";

const Settings = () => {
  const [activeSetting, setActiveSetting] = useState(null);
  //choose setting to display
  const renderActiveSetting = () => {
    switch (activeSetting) {
      case "Medical Aids":
        return <MedicalAids />;
      case "Admin":
        return <Admin />;
      case "Locums":
        return <Locums />;
      default:
        return "";
    }
  };

  const handleSettingClick = (setting) => {
    setActiveSetting(activeSetting === setting ? null : setting);
  };

  return (
    <div className="p-4">
      {activeSetting === null ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <ul className="space-y-4">
            <li>
              <button
                className="w-full text-left bg-white border-b border-gray-300 hover:bg-gray-100 text-lg font-semibold p-4 rounded transition duration-200"
                onClick={() => handleSettingClick("Admin")}
              >
                Admin
              </button>
            </li>
            <li>
              <button
                className="w-full text-left bg-white border-b border-gray-300 hover:bg-gray-100 text-lg font-semibold p-4 rounded transition duration-200"
                onClick={() => handleSettingClick("Medical Aids")}
              >
                Medical Aids
              </button>
            </li>
            <li>
              <button
                className="w-full text-left bg-white border-b border-gray-300 hover:bg-gray-100 text-lg font-semibold p-4 rounded transition duration-200"
                onClick={() => handleSettingClick("Locums")}
              >
                Locum Doctors
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <div className="flex flex-col">
          <button
            className="mb-4 text-red-500"
            onClick={() => setActiveSetting(null)}
          >
            Back to Settings
          </button>
          <div className="border p-4 rounded bg-gray-100">
            {renderActiveSetting()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
