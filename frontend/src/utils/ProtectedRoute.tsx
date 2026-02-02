import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const ProtectedRoute: React.FC = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userdata, token } = useSelector((state: any) => state.auth);
  if (!userdata || !token) {
    navigate("/login", { state: { from: location } });
    return null;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
