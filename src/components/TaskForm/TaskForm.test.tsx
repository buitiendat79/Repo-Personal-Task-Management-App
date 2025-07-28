import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskForm from ".";
import { TestProviders } from "../../test/TestProviders";
import { Priority } from "../../types/task";

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

  it("should show errors when submitting empty form", async () => {
    render(
      <TestProviders>
        <TaskForm />
      </TestProviders>
    );

    fireEvent.input(screen.getByLabelText(/Tên task/i), {
      target: { value: " " },
    });
    fireEvent.blur(screen.getByLabelText(/Tên task/i));

    fireEvent.change(screen.getByLabelText(/Deadline/i), {
      target: { value: "" },
    });
    fireEvent.blur(screen.getByLabelText(/Deadline/i));

    fireEvent.change(screen.getByLabelText(/Ưu tiên/i), {
      target: { value: "" },
    });
    fireEvent.blur(screen.getByLabelText(/Ưu tiên/i));

    fireEvent.click(screen.getByRole("button", { name: /Tạo mới/i }));

    await waitFor(() => {
      expect(screen.getByTestId("error-title")).toBeInTheDocument();
      expect(screen.getByTestId("error-deadline")).toBeInTheDocument();
      expect(screen.getByTestId("priority-select")).toBeInTheDocument();
    });
  });

  it("should enable submit when valid data is entered", async () => {
    render(
      <TestProviders>
        <TaskForm />
      </TestProviders>
    );

    fireEvent.input(screen.getByLabelText(/Tên task/i), {
      target: { value: "Task 1" },
    });

    const today = new Date().toISOString().split("T")[0];
    fireEvent.change(screen.getByLabelText(/Deadline/i), {
      target: { value: today },
    });

    fireEvent.change(screen.getByLabelText(/Ưu tiên/i), {
      target: { value: "High" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Tạo mới/i })).toBeEnabled();
    });
  });

  it("should display checklist validation", async () => {
    render(
      <TestProviders>
        <TaskForm />
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: /Thêm/i }));

    const checklistInput = screen.getByPlaceholderText(/Item 1/i);
    fireEvent.blur(checklistInput); // Trigger validation

    fireEvent.click(screen.getByRole("button", { name: /Tạo mới/i }));

    await waitFor(() => {
      expect(screen.getByTestId("error-checklist-0")).toHaveTextContent(
        /Checklist 1: Checklist không được để trống/i
      );
    });
  });
});
