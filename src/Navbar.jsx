import React, { useContext } from "react";
import { Globals } from "../Globals";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";

const Navbar = () => {
  const { setLogged, setUser, menu, setMenu, user, locum } =
    useContext(Globals);
  function handleClick() {
    setLogged(false);
    localStorage.removeItem("user");
    setUser("");
  }
  const toggleMenu = () => {
    setMenu(!menu);
  };

  return (
    <div className="flex justify-between px-6 bg-blue-800">
      <ul className="flex justify-between font-medium py-4">
        <p className="text-lg text-white">{user}</p>
        <li
          onClick={() => handleClick()}
          className={`ml-6 p-2 cursor-pointer bg-gray-100 rounded-md transition duration-200 hover:bg-gray-200 ${
            locum && "hidden"
          }`}
        >
          Sign Out
        </li>
      </ul>
      <div className="lg:hidden flex justify-center">
        <button onClick={() => toggleMenu()}>
          {menu ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </button>
      </div>
      
    </div>
  );
};

export default Navbar;
