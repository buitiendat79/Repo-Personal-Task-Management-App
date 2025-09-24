import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskForm from "../TaskForm";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { useFormContext, useForm, FormProvider } from "react-hook-form";

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
  default: ({ onChange, selected, name }: any) => (
    <input
      type="date"
      data-testid="datepicker"
      name={name || "deadline"}
      // show ISO date if selected (YYYY-MM-DD)
      value={selected ? new Date(selected).toISOString().slice(0, 10) : ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange && onChange(new Date(v));
      }}
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
    // debug log để nhìn console khi chạy test nếu cần
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    createMutate.mockImplementation((data, opts) => {
      // helpful log to debug payload if still failing
      console.log("DEBUG createMutate payload:", data);
      opts?.onSuccess?.();
    });

    render(<TaskForm mode="create" />);

    // LẤY ELEMENTS
    const titleInput = screen.getByLabelText(/tên task/i);
    const descInput = screen.getByLabelText(/mô tả/i);
    const dateInput = screen.getByTestId("datepicker");
    const prioritySelect = screen.getByLabelText(/ưu tiên/i);
    const submitBtn = screen.getByRole("button", { name: /tạo mới/i });

    // TYPING (userEvent cho chính xác hơn)
    await userEvent.type(titleInput, "Task A");
    await userEvent.type(descInput, "Some description");

    // set date (type to input[type=date] -> format YYYY-MM-DD)
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2025-09-20");

    // select option
    await userEvent.selectOptions(prioritySelect, "High");

    // click submit
    await userEvent.click(submitBtn);

    // chờ và assert
    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledTimes(1);
      expect(notifySuccess).toHaveBeenCalledWith("Tạo task thành công!");
    });

    consoleSpy.mockRestore();
  });
});

describe("TaskForm (edit mode)", () => {
  const defaultValues = {
    status: "In Progress",
    title: "Old title",
    description: "Old desc",
    deadline: "2025-09-23",
    priority: "Medium",
    checklist: [{ content: "Item 1" }, { content: "Item 2" }],
  };

  const renderPage = () => {
    render(<TaskForm mode="edit" defaultValues={defaultValues} />);
  };

  it("render tiêu đề form", () => {
    renderPage();
    expect(screen.getByText(/Cập nhật Task/i)).toBeInTheDocument();
  });

  it("render đủ các field cơ bản", () => {
    renderPage();

    expect(screen.getByLabelText(/Trạng thái/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên task/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mô tả/i)).toBeInTheDocument();
    expect(screen.getByTestId("datepicker")).toBeInTheDocument();
    expect(screen.getByLabelText(/Ưu tiên/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Checklist/i)[0]).toBeInTheDocument();
  });

  it("render đủ các nút action", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /Cập nhật/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Xoá task/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Huỷ/i })).toBeInTheDocument();
  });
});
