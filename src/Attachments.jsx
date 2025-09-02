import React, { useState, useEffect, useContext } from "react";
import { db } from "../firebase.js";
import { Globals } from "../Globals.js";
import { doc, deleteDoc } from "firebase/firestore";

const Attachments = () => {
  const { attachments } = useContext(Globals);

  const [searchName, setSearchName] = useState("");

  //delete attachment
  const deleteAttachment = async (identity) => {
    await deleteDoc(doc(db, "Attachments", identity));
  };
  //filter by name
  const filteredAttachments = attachments.filter((attachment) =>
    attachment.fileName.toLowerCase().includes(searchName.toLowerCase())
  );
  return (
    <div className=" mx-auto lg:p-4 p-1">
      <h2 className="text-xl font-semibold mb-2 lg:mb-4 text-center">
        Attachments
      </h2>
      <div className="flex justify-center mb-2 lg:mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border border-gray-300 rounded p-2 w-1/3"
        />
      </div>
      <ul className="mt-2 list-none">
        {filteredAttachments
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((attachment) => (
            <li
              key={attachment.id}
              className="grid grid-cols-4 p-2 border-b border-gray-200"
            >
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm lg:text-base col-span-2 font-medium"
              >
                {attachment.fileName}
              </a>
              <span className="text-gray-500 text-sm">
                {new Date(attachment.date).toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteAttachment(attachment.id)}
                className="text-red-600 hover:underline text-sm"
              >
                delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Attachments;
