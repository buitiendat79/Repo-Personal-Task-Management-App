import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../api/supabaseClient";
import { setUser } from "../features/auth/AuthSlice";

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
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

  if (!user && !hasSession) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
