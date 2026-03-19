import React, { lazy, Suspense, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AllReports = lazy(() => import("./pages/AllReports"));
const UserManagement = lazy(() => import("./pages/ManageUser"));
const ReportManagement = lazy(() => import("./pages/ManageReports"));
const RoleManagement = lazy(() => import("./pages/ManageRoles.tsx"));
const SecurityManagement = lazy(() => import("./pages/ManageSecurity.tsx"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const RecentReports = lazy(() => import("./pages/RecentReports"));
const FavouriteReports = lazy(() => import("./pages/FavouriteReports"));
const Enquiries = lazy(() => import("./pages/Enquiries"));
const GridReports = lazy(() => import("./pages/GridReports"));
import { LoadingSpinner } from "./components/public/LoadingSpinner";
import { DashboardLayout } from "./components/layout/DashBoardLayout";
import { useDispatch, useSelector } from "react-redux";
import { useFetch } from "./hooks/useFetch";
import { logOut, setUser } from "./store/slices/authSlice";
const NotFound = lazy(() => import("./pages/NotFound"));

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state: any) => state.auth);

  const {
    data: meData,
    isPending: isMeLoading,
    isError: isMeError,
  } = useFetch({
    endpoint: token ? "api/auth/me" : undefined,
    isAuth: true,
  });

  useEffect(() => {
    if (!token || !meData) return;
    const resolvedUser = meData?.data || meData?.user || meData;
    if (resolvedUser) {
      dispatch(setUser({ userdata: resolvedUser }));
    }
  }, [token, meData, dispatch]);

  useEffect(() => {
    if (token && isMeError) {
      dispatch(logOut());
      navigate("/login");
    }
  }, [token, isMeError, dispatch, navigate]);

  useEffect(() => {
    if (!token && location.pathname !== "/login") {
      navigate("/login");
    } else if (token && location.pathname === "/login") {
      navigate("/dashboard");
    }
  }, [token, location.pathname, navigate]);

  if (token && !userdata && isMeLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="all-reports" element={<AllReports />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="role-management" element={<RoleManagement />} />
          <Route path="security-management" element={<SecurityManagement />} />
          <Route path="report-management" element={<ReportManagement />} />
          <Route path="favourites" element={<FavouriteReports />} />
          <Route path="recent-reports" element={<RecentReports />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="grid-reports" element={<GridReports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
