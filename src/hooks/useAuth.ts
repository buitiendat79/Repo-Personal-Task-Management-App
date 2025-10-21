import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<Session["user"] | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user };
}
