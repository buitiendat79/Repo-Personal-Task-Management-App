// src/components/TaskForm/TaskForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskForm from ".";
import { Priority } from "../../types/task";
import { TestProviders } from "../../test/TestProviders";

describe("TaskForm - Unit Test", () => {
  it("should render all fields", () => {
    render(
      <TestProviders>
        <TaskForm />
      </TestProviders>
    );

    expect(screen.getByLabelText(/Tên task/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deadline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ưu tiên/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Checklist/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Tạo mới/i })).toBeDisabled();
  });

  it("should show error when submitting empty form", async () => {
    render(
      <TestProviders>
        <TaskForm />
      </TestProviders>
    );

    const submitBtn = screen.getByRole("button", { name: /Tạo mới/i });

    // Giả lập blur để trigger lỗi thủ công:
    const titleInput = screen.getByLabelText(/Tên task/i);
    fireEvent.blur(titleInput); // ← quan trọng!

    fireEvent.click(submitBtn); // hoặc fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId("error-title")).toBeInTheDocument();
    });

    expect(
      await screen.findByText(/Vui lòng chọn deadline/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Vui lòng chọn mức ưu tiên/i)
    ).toBeInTheDocument();
  });

  it("should enable submit when valid data is entered", async () => {
    render(
      <TestProviders>
        <TaskForm />
      </TestProviders>
    );

    await fireEvent.input(screen.getByLabelText(/Tên task/i), {
      target: { value: "Task 1" },
    });

    const today = new Date().toISOString().split("T")[0];
    await fireEvent.change(screen.getByLabelText(/Deadline/i), {
      target: { value: today },
    });

    await fireEvent.change(screen.getByTestId("priority-select"), {
      target: { value: Priority.HIGH },
    });

    expect(screen.getByRole("button", { name: /Tạo mới/i })).toBeEnabled();
  });

  it("should display checklist validation", async () => {
    render(
      <TestProviders>
        <TaskForm />
      </TestProviders>
    );

    const addBtn = screen.getByRole("button", { name: /Thêm/i });
    await fireEvent.click(addBtn);

    const submitBtn = screen.getByRole("button", { name: /Tạo mới/i });
    await fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Checklist 1: Không được để trống/i)
    ).toBeInTheDocument();
  });
});
