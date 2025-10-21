import { vi } from "vitest";

vi.mock("../api/supabaseClient", () => {
  // create mocks so we can inspect them later
  const getSession = vi.fn();
  const onAuthStateChange = vi.fn();
  return {
    supabase: {
      auth: {
        getSession,
        onAuthStateChange,
      },
    },
  };
});

// now normal imports
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { supabase } from "../api/supabaseClient";

describe("useAuth", () => {
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user session on mount", async () => {
    const mockUser = { id: "123", email: "test@example.com" };

    // prepare mocks
    (supabase.auth.getSession as unknown as vi.Mock).mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });

    (supabase.auth.onAuthStateChange as unknown as vi.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { result } = renderHook(() => useAuth());

    // wait for effect to call getSession
    await waitFor(
      () => {
        expect(
          supabase.auth.getSession as unknown as vi.Mock
        ).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 }
    );

    expect(result.current.user).toEqual(mockUser);
  });

  it("should update user when auth state changes", async () => {
    // ensure initial session is null
    (supabase.auth.getSession as unknown as vi.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    let handler: any = undefined;
    // mock onAuthStateChange to capture the callback (supabase v2 style: onAuthStateChange(callback))
    (supabase.auth.onAuthStateChange as unknown as vi.Mock).mockImplementation(
      (cb: any) => {
        handler = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }
    );

    const { result } = renderHook(() => useAuth());

    // wait until handler is set by useEffect calling onAuthStateChange
    await waitFor(
      () => {
        if (typeof handler !== "function")
          throw new Error("handler not set yet");
      },
      { timeout: 1000 }
    );

    const mockUser = { id: "456", email: "change@example.com" };

    // Call handler in act and ensure React processes the state update
    await act(async () => {
      // call like Supabase would: (event, session)
      handler("SIGNED_IN", { user: mockUser });
      // let microtasks run so React can flush state
      await Promise.resolve();
    });

    // wait for the hook's state to update
    await waitFor(
      () => {
        expect(result.current.user).toEqual(mockUser);
      },
      { timeout: 1000 }
    );
  });

  it("should unsubscribe on unmount", async () => {
    (supabase.auth.getSession as unknown as vi.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    (supabase.auth.onAuthStateChange as unknown as vi.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { unmount } = renderHook(() => useAuth());

    // ensure effect ran
    await act(async () => {});

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
