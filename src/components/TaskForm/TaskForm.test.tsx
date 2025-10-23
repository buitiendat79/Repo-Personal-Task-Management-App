import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "../TaskForm";
import { vi } from "vitest";
import { renderWithClient } from "../../../test/utils/renderWithClient";

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

const mockCreateCalled = vi.fn();
const mockUpdateCalled = vi.fn();
const mockDeleteCalled = vi.fn();

vi.mock("../../features/tasks/useTask", () => ({
  useCreateTask: () => ({
    createTask: (payload: any, opts?: any) => {
      mockCreateCalled(payload);
      opts?.onSuccess?.();
    },
    isPending: false,
  }),
  useUpdateTask: () => ({
    updateTask: (taskId: string, payload: any) => {
      mockUpdateCalled(taskId, payload);
      return Promise.resolve();
    },
    isPending: false,
  }),
  useDeleteTask: () => ({
    deleteTask: (taskId: string, opts?: any) => {
      mockDeleteCalled(taskId);
      opts?.onSuccess?.();
      opts?.onSettled?.();
    },
    isPending: false,
  }),
}));

// Crreate Mode
describe("TaskForm - Create Mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Case 1: Hiển thị form CreateTask
  it("render_shouldDisplayCreateTitle_whenModeIsCreate", () => {
    renderWithClient(<TaskForm mode="create" />);
    expect(screen.getByText(/tạo mới task/i)).toBeInTheDocument();
  });

  // Case 2: Hiển thị thông báo tạo task thành công
  it("submit_shouldShowNotifySuccess_whenFormValid", async () => {
    // Arrange
    renderWithClient(<TaskForm mode="create" />);
    const user = userEvent.setup();

    const titleInput = screen.getByLabelText(/tên task/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/mô tả/i) as HTMLTextAreaElement;
    const deadlineInput = screen.getByLabelText(
      /deadline/i
    ) as HTMLInputElement;
    const prioritySelect = screen.getByLabelText(
      /ưu tiên/i
    ) as HTMLSelectElement;
    const submitBtn = screen.getByRole("button", { name: /tạo mới/i });

    fireEvent.change(titleInput, { target: { value: "New Task" } });
    fireEvent.change(descInput, { target: { value: "Some description" } });
    fireEvent.change(deadlineInput, { target: { value: "2025-10-20" } });
    await user.selectOptions(prioritySelect, "High");

    await waitFor(() => {
      expect(submitBtn).toBeEnabled();
    });

    await user.click(submitBtn);

    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith(
        expect.stringMatching(/tạo task thành công/i)
      );
      expect(navigateMock).toHaveBeenCalledWith("/tasks");
    });
  });

  // Case 3: Hiển thị lỗi thiếu tên task
  it("submit_shouldShowError_whenTitleMissing", async () => {
    // Arrange
    renderWithClient(<TaskForm mode="create" />);
    const user = userEvent.setup();
    const submitBtn = screen.getByRole("button", { name: /tạo mới/i });

    // Act
    await user.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText((text) =>
          text.toLowerCase().includes("vui lòng nhập tên task")
        )
      ).toBeInTheDocument();
    });
  });

  // Case 4: Hiển thị thông báo lỗi api
  it("submit_shouldShowNotifyError_whenAPIFails", async () => {
    // Arrange
    mockCreateMutate.mockImplementation(() => {
      throw new Error("API failed");
    });

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

// Edit Mode
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

  // Case 1: Hiển thị form Cập nhật task
  it("render_shouldDisplayEditTitle_whenModeIsEdit", () => {
    // Arrange
    renderWithClient(<TaskForm mode="edit" defaultValues={defaultValues} />);

    // Assert
    expect(screen.getByText(/cập nhật task/i)).toBeInTheDocument();
  });

  // Case 2: Hiển thị thông báo cập nhật task thành công
  it("submit_shouldShowNotifySuccess_whenUpdateAPISuccess", async () => {
    // Arrange
    renderWithClient(<TaskForm mode="edit" defaultValues={defaultValues} />);
    const user = userEvent.setup();

    const titleInput = screen.getByLabelText(/tên task/i);
    const submitBtn = screen.getByRole("button", { name: /cập nhật/i });

    // Act
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");
    await user.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalled();
      expect(notifySuccess).toHaveBeenCalledWith(
        expect.stringMatching(/cập nhật task thành công/i)
      );
      expect(navigateMock).toHaveBeenCalledWith("/tasks");
    });
  });

  // Case 3: Hiển thị thông báo xóa task khi nhấn "delete"
  it("delete_shouldShowNotifySuccess_whenUserConfirmsDelete", async () => {
    // Arrange
    renderWithClient(<TaskForm mode="edit" defaultValues={defaultValues} />);
    const user = userEvent.setup();
    const deleteBtn = screen.getByRole("button", { name: /xoá task/i });

    // Act
    await user.click(deleteBtn);

    // modal confirm shows “Xoá” button again
    const confirmBtn = await screen.findByRole("button", { name: /^xoá$/i });
    await user.click(confirmBtn);

    // Assert
    await waitFor(() => {
      expect(mockDeleteMutate).toHaveBeenCalled();
      expect(notifySuccess).toHaveBeenCalledWith(
        expect.stringMatching(/xoá task thành công/i)
      );
      expect(navigateMock).toHaveBeenCalledWith("/tasks");
    });
  });
});
