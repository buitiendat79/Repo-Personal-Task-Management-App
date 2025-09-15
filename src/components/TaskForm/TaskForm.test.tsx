import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskForm from "../TaskForm";
import { vi } from "vitest";

// Mock hooks & utils
const createMutate = vi.fn();
const updateMutate = vi.fn();
const deleteMutate = vi.fn();

vi.mock("../../features/tasks/useTask", () => ({
  useCreateTask: () => ({
    mutate: createMutate,
    isPending: false,
  }),
  useDeleteTask: () => ({
    mutate: deleteMutate,
    isPending: false,
  }),
  useUpdateTask: () => ({
    mutate: updateMutate,
    isPending: false,
  }),
}));

vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: () => ({ id: "user-123" }),
}));

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
vi.mock("../../utils/notify", () => ({
  notifySuccess: (msg: string) => notifySuccess(msg),
  notifyError: (msg: string) => notifyError(msg),
}));

// Fake DatePicker
vi.mock("react-datepicker", () => ({
  __esModule: true,
  default: ({ onChange, selected }: any) => (
    <input
      data-testid="datepicker"
      value={selected ? "2025-09-20" : ""}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
}));

describe("TaskForm (create mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render form tạo task", () => {
    render(<TaskForm mode="create" />);
    expect(screen.getByText("Tạo mới Task")).toBeInTheDocument();
  });

  it("submit hợp lệ → gọi create", async () => {
    createMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.();
    });

    render(<TaskForm mode="create" />);
    fireEvent.change(screen.getByLabelText("Tên task"), {
      target: { value: "Task A" },
    });
    fireEvent.change(screen.getByTestId("datepicker"), {
      target: { value: "2025-09-20" },
    });
    fireEvent.change(screen.getByLabelText("Ưu tiên"), {
      target: { value: "High" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Tạo mới/i }));

    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith("Tạo task thành công!");
      expect(navigateMock).toHaveBeenCalledWith("/tasks");
    });
  });
});

describe("TaskForm (edit mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultValues = {
    id: "task-1",
    title: "Old title",
    description: "Old desc",
    deadline: new Date("2025-09-20"),
    priority: "Medium",
    checklist: [{ content: "Item 1" }],
  };

  it("render form với dữ liệu mặc định", () => {
    render(<TaskForm mode="edit" defaultValues={defaultValues} />);
    expect(screen.getByLabelText("Tên task")).toHaveValue("Old title");
    expect(screen.getByLabelText("Mô tả")).toHaveValue("Old desc");
    expect(screen.getByPlaceholderText("Item 1")).toHaveValue("Item 1");
  });

  it("cập nhật task thành công", async () => {
    updateMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.();
    });

    render(<TaskForm mode="edit" defaultValues={defaultValues} />);
    fireEvent.change(screen.getByLabelText("Tên task"), {
      target: { value: "Updated title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Cập nhật/i }));

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalled();
      expect(notifySuccess).toHaveBeenCalledWith("Cập nhật task thành công!");
      expect(navigateMock).toHaveBeenCalledWith("/tasks");
    });
  });

  it("xóa task thành công sau khi confirm", async () => {
    deleteMutate.mockImplementation((_id, opts) => {
      opts?.onSuccess?.();
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TaskForm mode="edit" defaultValues={defaultValues} />);
    fireEvent.click(screen.getByRole("button", { name: /xóa/i }));

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith("task-1", expect.anything());
      expect(notifySuccess).toHaveBeenCalledWith("Xóa task thành công!");
      expect(navigateMock).toHaveBeenCalledWith("/tasks");
    });
  });
});
