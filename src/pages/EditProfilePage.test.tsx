// EditProfilePage.test.tsx
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import EditProfilePage from "./EditProfilePage";

// ---- Mocks ----

// Mock DashboardLayout để tránh kéo theo layout phức tạp
vi.mock("../layout/DashboardLayout", () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// Cho phép assert navigate("/profile")
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock supabase client (auth.getUser, auth.updateUser)
const mockGetUser = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock("../api/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: (...args: any[]) => mockGetUser(...args),
      updateUser: (...args: any[]) => mockUpdateUser(...args),
    },
  },
}));

// Mock action creator setUser (để action.type = 'auth/setUser')
vi.mock("../features/auth/AuthSlice", () => ({
  setUser: (payload: any) => ({ type: "auth/setUser", payload }),
}));

// URL.createObjectURL đôi khi cần khi đổi ảnh
beforeAll(() => {
  // @ts-expect-error - patch global for JSDOM
  global.URL.createObjectURL = vi.fn(() => "blob:mock");
});

// ---- Test Store tối giản ----
const authReducer = (
  state = {
    user: null as null | {
      id: string;
      email: string;
      display_name?: string;
      created_at: string;
    },
  },
  action: any
) => {
  switch (action.type) {
    case "auth/setUser":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: null } },
  });

const renderPage = () => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>
    </Provider>
  );
};

// ---- Fixtures ----
const userInitial = {
  id: "u_1",
  email: "dat@example.com",
  created_at: "2023-01-15T00:00:00Z",
  user_metadata: { display_name: "Đạt Bùi" },
};

const userUpdated = {
  ...userInitial,
  user_metadata: { display_name: "Tên mới" },
};

// ---- Lifecycle ----
beforeEach(() => {
  mockNavigate.mockClear();
  mockGetUser.mockReset();
  mockUpdateUser.mockReset();

  // Mặc định: lần gọi getUser đầu tiên trả userInitial
  mockGetUser.mockResolvedValue({
    data: { user: userInitial },
    error: null,
  });

  // Mặc định: updateUser OK
  mockUpdateUser.mockResolvedValue({ data: {}, error: null });
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---- Tests ----
describe("EditProfilePage", () => {
  it("hiển thị màn hình loading rồi render form với dữ liệu user", async () => {
    renderPage();

    // Loading xuất hiện ngay render đầu
    expect(screen.getByText(/Đang tải/i)).toBeInTheDocument();

    // Sau khi load xong -> tiêu đề trang
    expect(
      await screen.findByRole("heading", { name: /Sửa thông tin cá nhân/i })
    ).toBeInTheDocument();

    // Input 'Họ tên' có giá trị từ user_metadata.display_name
    const nameInput = screen.getByLabelText(/Họ tên/i) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe("Đạt Bùi");

    // Email & Ngày đăng ký disabled
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const createdAtInput = screen.getByLabelText(
      /Ngày đăng ký/i
    ) as HTMLInputElement;
    expect(emailInput).toBeDisabled();
    expect(createdAtInput).toBeDisabled();
    expect(emailInput.value).toBe("dat@example.com");
    // Chỉ cần chứa năm 2023 để tránh lệch múi giờ trong môi trường test
    expect(createdAtInput.value).toMatch(/2023/);
  });

  it("click Huỷ sẽ navigate về /profile", async () => {
    renderPage();
    await screen.findByRole("heading", { name: /Sửa thông tin cá nhân/i });

    fireEvent.click(screen.getByRole("button", { name: /Hủy/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("đổi ảnh: chọn file không phải ảnh -> hiện thông báo lỗi", async () => {
    renderPage();
    await screen.findByRole("heading", { name: /Sửa thông tin cá nhân/i });

    // const fileInput =
    //   //   screen.getByLabelText(/Thay ảnh/i, { selector: "input[type='file']" }) ||
    //   screen.getByRole("textbox", { hidden: true }); // fallback (không dùng thực tế)

    const badFile = new File(["abc"], "note.txt", { type: "text/plain" });
    const hiddenInput =
      screen.getByDisplayValue("", { selector: "input[type='file']" }) ||
      fileInput;

    fireEvent.change(hiddenInput as HTMLInputElement, {
      target: { files: [badFile] },
    });

    expect(
      await screen.findByText(/Vui lòng chọn file ảnh hợp lệ/i)
    ).toBeInTheDocument();
  });

  it("Lưu thay đổi thành công: gọi updateUser và hiển thị thông báo thành công", async () => {
    // Lần 1: getUser (load trang) -> userInitial
    // Lần 2: getUser (refetch sau update) -> userUpdated
    mockGetUser
      .mockResolvedValueOnce({ data: { user: userInitial }, error: null })
      .mockResolvedValueOnce({ data: { user: userUpdated }, error: null });

    renderPage();
    await screen.findByRole("heading", { name: /Sửa thông tin cá nhân/i });

    const nameInput = screen.getByLabelText(/Họ tên/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Tên mới" } });

    // Click Lưu
    fireEvent.click(screen.getByRole("button", { name: /Lưu thay đổi/i }));

    // Trong lúc saving có thể xuất hiện "Đang lưu..."
    expect(
      await screen.findByRole("button", { name: /Đang lưu/i })
    ).toBeInTheDocument();

    // updateUser được gọi với data.display_name = "Tên mới"
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { display_name: "Tên mới" },
      });
    });

    // Sau refetch, hiển thị message thành công và input cập nhật giá trị
    expect(await screen.findByText(/Cập nhật thành công/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/Họ tên/i) as HTMLInputElement).value).toBe(
      "Tên mới"
    );
  });

  it("Lưu thay đổi thất bại: hiển thị lỗi từ Supabase", async () => {
    mockUpdateUser.mockResolvedValueOnce({
      data: null,
      error: { message: "Update failed" },
    });

    renderPage();
    await screen.findByRole("heading", { name: /Sửa thông tin cá nhân/i });

    fireEvent.click(screen.getByRole("button", { name: /Lưu thay đổi/i }));

    expect(await screen.findByText(/Update failed/i)).toBeInTheDocument();
  });

  it("khi không đăng nhập (getUser trả null) -> hiển thị 'Không tìm thấy người dùng.'", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    renderPage();

    // Loading trước
    expect(screen.getByText(/Đang tải/i)).toBeInTheDocument();

    // Sau khi load xong
    expect(
      await screen.findByText(/Không tìm thấy người dùng\./i)
    ).toBeInTheDocument();
  });
});
