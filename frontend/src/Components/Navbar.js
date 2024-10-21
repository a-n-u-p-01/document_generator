function Navbar() {
    return (
      <nav className="w-full z-10 h-20 bg-gray-800 text-black flex justify-between pt-4 pl-5 pr-5 fixed top-0">
        <div className="flex gap-5">
          <button
            name="logo"
            className="flex items-center justify-center gap-3 p-[13px] text-slate-400 font-bold text-2xl shadow-3d transition-transform duration-200 hover:transform hover:-translate-y-1 hover:scale-105"
          onClick={()=>window.location.reload()}
          >
            Template
          </button>
        </div>
      </nav>
    );
  }
  
  export default Navbar;
  