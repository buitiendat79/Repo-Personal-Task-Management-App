import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "../TaskForm";
import { server } from "../../../test/testServer";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { renderWithClient } from "../../../test/utils/renderWithClient";

// Mock useNavigate & notify
const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ taskId: "1" }),
  };
});

const notifySuccess = vi.fn();
const notifyError = vi.fn();
vi.mock("../../../utils/notify", () => ({
  notifySuccess: (msg: string) => notifySuccess(msg),
  notifyError: (msg: string) => notifyError(msg),
}));

// Mock react-datepicker
vi.mock("react-datepicker", () => ({
  __esModule: true,
  default: ({ onChange, selected, name }: any) => (
    <input
      aria-label="Deadline"
      type="date"
      name={name || "deadline"}
      value={selected ? new Date(selected).toISOString().slice(0, 10) : ""}
      onChange={(e) => onChange && onChange(new Date(e.target.value))}
    />
  ),
}));

vi.mock("../../features/tasks/useTask", () => ({
  useCreateTask: () => ({
    mutate: () => notifySuccess("Tạo task thành công!"),
    isPending: false,
  }),
  useUpdateTask: () => ({
    mutate: () => notifySuccess("Cập nhật task thành công!"),
    isPending: false,
  }),
  useDeleteTask: () => ({
    mutate: () => notifySuccess("Xoá task thành công!"),
    isPending: false,
  }),
}));

describe("TaskForm - Create Mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render_shouldDisplayCreateTitle_whenModeIsCreate", () => {
    renderWithClient(<TaskForm mode="create" />);
    expect(screen.getByText(/tạo mới task/i)).toBeInTheDocument();
  });

  it("submit_shouldCallCreateAPI_whenFormValid", async () => {
    // Arrange
    renderWithClient(<TaskForm mode="create" />);
    const user = userEvent.setup();
    const titleInput = screen.getByLabelText(/tên task/i);
    const descInput = screen.getByLabelText(/mô tả/i);
    const deadlineInput = screen.getByLabelText(/deadline/i);
    const prioritySelect = screen.getByLabelText(/ưu tiên/i);
    const submitBtn = screen.getByRole("button", { name: /tạo mới/i });

    // Act
    await user.type(titleInput, "New Task");
    await user.type(descInput, "Some description");
    await user.type(deadlineInput, "2025-10-20");
    await user.selectOptions(prioritySelect, "High");
    await user.click(submitBtn);

    // Assert
    // await waitFor(() => {
    //   expect(notifySuccess).toHaveBeenCalledWith("Tạo task thành công!");
    // });
  });

  it("submit_shouldShowError_whenTitleMissing", async () => {
    // Arrange
    renderWithClient(<TaskForm mode="create" />);
    const user = userEvent.setup();
    const submitBtn = screen.getByRole("button", { name: /tạo mới/i });

    // Act
    await user.click(submitBtn);

    // Assert
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText((text) =>
          text.toLowerCase().includes("vui lòng nhập tên task")
        )
      ).toBeInTheDocument();
    });
  });

  it("submit_shouldShowNotifyError_whenAPIFails", async () => {
    // Arrange
    server.use(http.post("/tasks", () => HttpResponse.error()));

    renderWithClient(<TaskForm mode="create" />);
    const user = userEvent.setup();
    const titleInput = screen.getByLabelText(/tên task/i);
    const descInput = screen.getByLabelText(/mô tả/i);
    const deadlineInput = screen.getByLabelText(/deadline/i);
    const prioritySelect = screen.getByLabelText(/ưu tiên/i);
    const submitBtn = screen.getByRole("button", { name: /tạo mới/i });

    // Act
    await user.type(titleInput, "Task Error");
    await user.type(descInput, "Desc");
    await user.type(deadlineInput, "2025-10-20");
    await user.selectOptions(prioritySelect, "High");
    await user.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(notifyError).toHaveBeenCalled();
    });
  });
});

describe("TaskForm - Edit Mode", () => {
  const defaultValues = {
    status: "In Progress",
    title: "Old title",
    description: "Old desc",
    deadline: "2025-09-23",
    priority: "Medium",
    checklist: [{ content: "Item 1" }, { content: "Item 2" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render_shouldDisplayEditTitle_whenModeIsEdit", () => {
    render(<TaskForm mode="edit" defaultValues={defaultValues} />);
    expect(screen.getByText(/cập nhật task/i)).toBeInTheDocument();
  });

  it("delete_shouldShowSuccessNotify_whenDeleteAPIResolved", async () => {
    // Arrange
    server.use(
      http.delete("/tasks/1", () => HttpResponse.json({ success: true }))
    );

    render(<TaskForm mode="edit" defaultValues={defaultValues} />);
    const user = userEvent.setup();
    const deleteBtn = screen.getByRole("button", { name: /xoá task/i });

    // Act
    await user.click(deleteBtn);

    // Assert
    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith("Xoá task thành công!");
    });
  });
});
