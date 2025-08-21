// src/features/user/UserSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../api/supabaseClient";

export interface UserState {
  id: string | null;
  email: string | null;
  full_name: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  email: null,
  full_name: null,
  loading: false,
  error: null,
};

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async ({ full_name }: { full_name: string }, { rejectWithValue }) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) return rejectWithValue(authError.message);
    if (!user) return rejectWithValue("No user");

    const { data, error } = await supabase
      .from("users")
      .update({ full_name })
      .eq("id", user.id)
      .select("id,email,full_name")
      .maybeSingle(); // ✅

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.full_name = action.payload.full_name;
      state.loading = false;
      state.error = null;
    },
    clearUser: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.full_name = action.payload.full_name;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Update failed";
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
