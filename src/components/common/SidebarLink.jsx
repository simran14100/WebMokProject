import { useState } from "react";
import * as Icons from "react-icons/vsc";
import { useDispatch } from "react-redux";
import { NavLink, matchPath, useLocation } from "react-router-dom";

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName];
  const location = useLocation();
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  // Handle section headers
  if (link.isHeader) {
    return (
      <div className="px-8 py-3 mt-8 mb-4 text-xs font-bold text-yellow-50 uppercase tracking-wider border-b border-richblack-700 bg-gradient-to-r from-yellow-800/10 to-transparent">
        <div className="flex items-center gap-x-2">
          {Icon && <Icon className="text-lg opacity-80" />}
          <span>{link.name}</span>
        </div>
      </div>
    );
  }

  // Handle items with sublinks
  if (link.subLinks && link.subLinks.length > 0) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative w-full px-8 py-2 text-sm font-medium transition-all duration-200 flex items-center justify-between ${
            isExpanded
              ? "bg-yellow-800 text-yellow-50"
              : "bg-opacity-0 text-richblack-300 hover:bg-richblack-700 hover:text-richblack-5"
          }`}
        >
          <span
            className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          ></span>
          
          <div className="flex items-center gap-x-2">
            {Icon && <Icon className="text-lg" />}
            <span>{link.name}</span>
          </div>
          
          <Icons.VscChevronRight 
            className={`text-sm transition-transform duration-200 ${
              isExpanded ? "rotate-90" : "rotate-0"
            }`}
          />
        </button>
        
        {/* Sublinks */}
        {isExpanded && (
          <div className="bg-richblack-900 border-l-2 border-yellow-800/30 ml-4">
            {link.subLinks.map((subLink, index) => (
              <NavLink
                key={index}
                to={subLink.path}
                className={({ isActive }) =>
                  `relative block px-8 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-yellow-800 text-yellow-50"
                      : "bg-opacity-0 text-richblack-300 hover:bg-richblack-700 hover:text-richblack-5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    ></span>
                    <div className="flex items-center gap-x-2 pl-4">
                      <span className="w-2 h-2 rounded-full bg-richblack-300"></span>
                      <span>{subLink.name}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular navigation link
  return (
    <NavLink
      to={link.path}
      className={`relative px-8 py-2 text-sm font-medium ${
        matchRoute(link.path)
          ? "bg-yellow-800 text-yellow-50"
          : "bg-opacity-0 text-richblack-300"
      } transition-all duration-200`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          matchRoute(link.path) ? "opacity-100" : "opacity-0"
        }`}
      ></span>
      
      <div className="flex items-center gap-x-2">
        {Icon && <Icon className="text-lg" />}
        <span>{link.name}</span>
      </div>
    </NavLink>
  );
}
