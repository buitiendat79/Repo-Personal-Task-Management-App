import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { notifySuccess, notifyError } from "./notify";
import { act } from "react-dom/test-utils";

describe("notify utility", () => {
  // Dọn dẹp DOM giữa các test
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should render a success toast and remove it after 1s", () => {
    const message = "Task created successfully";

    act(() => {
      notifySuccess(message);
    });

    const toast = document.querySelector("div.bg-green-600");
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toBe(message);

    // simulate passing 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(document.querySelector("div.bg-green-600")).toBeNull();
  });

  it("should render an error toast and remove it after 1s", () => {
    const message = "Something went wrong";

    act(() => {
      notifyError(message);
    });

    const toast = document.querySelector("div.bg-red-600");
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toBe(message);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(document.querySelector("div.bg-red-600")).toBeNull();
  });
});
