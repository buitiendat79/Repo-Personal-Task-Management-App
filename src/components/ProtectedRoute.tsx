import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../api/supabaseClient";
import { setUser } from "../features/auth/AuthSlice";
import { RootState } from "../app/store";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Kiem tra session từ Supabase
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        dispatch(setUser(data.session.user));
        setHasSession(true);
      }
      setCheckingSession(false);
    };

    checkSession();
  }, [dispatch]);

  if (checkingSession) {
    return (
      <div className="text-center mt-10">Đang kiểm tra phiên đăng nhập...</div>
    );
  }

  // Dieu huong ve login
  if (!user && !hasSession) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
