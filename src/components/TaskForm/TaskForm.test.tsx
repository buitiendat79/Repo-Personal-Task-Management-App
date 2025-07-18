import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "./index";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../../app/store";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock useUser
vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: () => ({ id: "test-user-id" }),
}));

// Mock useCreateTask
vi.mock("../../features/tasks/useTask", () => ({
  useCreateTask: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Wrapper chung cho tất cả test
function renderWithProviders(ui = <TaskForm onSuccess={vi.fn()} />) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    </QueryClientProvider>
  );
}

describe("TaskForm - Unit Tests", () => {
  test("hiển thị đầy đủ các trường trong form", () => {
    renderWithProviders();
    expect(screen.getByLabelText(/tên task/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mô tả/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ưu tiên/i)).toBeInTheDocument();
    expect(screen.getByText("Checklist")).toBeInTheDocument();
  });

  test("hiển thị lỗi khi bỏ trống các trường bắt buộc", async () => {
    renderWithProviders();

    const titleInput = screen.getByLabelText(/tên task/i);
    const deadlineInput = screen.getByLabelText(/deadline/i);
    const prioritySelect = screen.getByLabelText(/ưu tiên/i);

    await userEvent.type(titleInput, "abc");
    await userEvent.clear(titleInput);

    await userEvent.type(deadlineInput, "2025-01-01");
    await userEvent.clear(deadlineInput);

    await userEvent.selectOptions(prioritySelect, "Medium");
    await userEvent.selectOptions(prioritySelect, "");

    const button = screen.getByRole("button", { name: /tạo mới/i });
    await userEvent.click(button);

    expect(
      await screen.findByText(/vui lòng nhập tên task/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/vui lòng chọn deadline/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/vui lòng chọn mức ưu tiên/i)
    ).toBeInTheDocument();
  });

  test("hiển thị lỗi nếu deadline trong quá khứ", async () => {
    renderWithProviders();
    const deadlineInput = screen.getByLabelText(/deadline/i);
    const button = screen.getByRole("button", { name: /tạo mới/i });

    await userEvent.clear(deadlineInput);
    await userEvent.type(deadlineInput, "2020-01-01");
    await userEvent.click(button);

    expect(
      await screen.findByText(/deadline không hợp lệ/i)
    ).toBeInTheDocument();
  });

  test("hiển thị lỗi nếu checklist item để trống", async () => {
    renderWithProviders();

    const addChecklistBtn = screen.getByText("+ Thêm checklist");
    fireEvent.click(addChecklistBtn); // Thêm checklist rỗng

    const createButton = screen.getByRole("button", { name: /tạo mới/i });
    fireEvent.click(createButton); // Submit form

    // Dùng regex mềm dẻo
    const checklistError = await screen.findByText(
      /Checklist\s*1:\s*Checklist không được để trống/i
    );

    expect(checklistError).toBeInTheDocument();
  });
});
