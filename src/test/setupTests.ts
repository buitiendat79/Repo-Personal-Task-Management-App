// src/test/setupTests.ts
import "@testing-library/jest-dom/vitest";

// // Add custom jest-dom matchers
// expect.extend(matchers);

// // Optional: Suppress console.error for known React warnings during tests
// vi.spyOn(console, "error").mockImplementation((msg) => {
//   if (
//     typeof msg === "string" &&
//     (msg.includes(
//       "useNavigate() may be used only in the context of a <Router>"
//     ) ||
//       msg.includes("No QueryClient set"))
//   ) {
//     return;
//   }
//   console.warn(msg);
// });
