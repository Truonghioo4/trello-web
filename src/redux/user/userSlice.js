import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { toast } from "react-toastify"
import authorizeAxiosInstance from "~/utils/authorizeAxios"
import { API_ROOT } from "~/utils/constants"

// Khởi tạo giá trị của một slice trong redux
const initialState = {
	currentUser: null
}
// Các hành động gọi api và cập nhật dữ liệu vào redux, dùng MiddleWare createAsyncThunk đi kèm với extraReducers
export const loginUserApi = createAsyncThunk(
	"user/loginUserApi",
	async (data) => {
		const response = await authorizeAxiosInstance.post(
			`${API_ROOT}/v1/users/login`,
			data
		)
		// Luu ý: axios sẽ trả về kết quả qua property của nó là data
		return response.data
	}
)

export const logoutUserAPI = createAsyncThunk(
	"user/logoutUserAPI",
	async (showSuccessMessage = true) => {
		const response = await authorizeAxiosInstance.delete(
			`${API_ROOT}/v1/users/logout`
		)
		if (showSuccessMessage) toast.success("Logged out successfully!")
		return response.data
	}
)

export const updateUserAPI = createAsyncThunk(
	"user/updateUserAPI",
	async (data) => {
		const response = await authorizeAxiosInstance.put(
			`${API_ROOT}/v1/users/update`,
			data
		)
		return response.data
	}
)

// Khởi tạo một slice trong kho lưu trữ redux
export const userSlice = createSlice({
	name: "user",
	initialState,
	// Reduces: nơi xủ lý dữ liệu đồng bộ
	reducers: {},
	// ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
	extraReducers: (builder) => {
		builder.addCase(loginUserApi.fulfilled, (state, action) => {
			// action.payload ở đây chính là cái response.data trả về ở trên
			const user = action.payload

			// Update data trong currentUser
			state.currentUser = user
		})
		builder.addCase(logoutUserAPI.fulfilled, (state) => {
			/**
			 * API logout sau khi gọi thành công thì sẽ clear thông tin currentUser về null ở đây
			 * Kết hợp ProtectedRoute đã làm ở App.js => code sẽ điều hướng chuẩn về trang Login
			 */
			state.currentUser = null
		})
		builder.addCase(updateUserAPI.fulfilled, (state, action) => {
			const user = action.payload
			state.currentUser = user
		})
	}
})

// Action là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập
// nhật lại dữ liệu thông qua reducer
// property actions là được redux tự động tạo theo tên của reducer
// export const { }= userSlice.actions

// Selectors: là nơi dành cho các componentd bên dưới được gọi bằng hook useSelector()
// để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentUser = (state) => {
	return state.user.currentUser
}

export const userReducer = userSlice.reducer
