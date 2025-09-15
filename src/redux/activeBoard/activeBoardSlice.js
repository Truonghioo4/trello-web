import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import authorizeAxiosInstance from "~/utils/authorizeAxios"
import { mapOrder } from "~/utils/sorts"
import { isEmpty } from "lodash"
import { generatePlaceholderCard } from "~/utils/formatters.js"
import { API_ROOT } from "~/utils/constants"
// Khởi tạo giá trị của một slice trong redux
const initialState = {
	currentActiveBoard: null
}

// Các hành động gọi api và cập nhật dữ liệu vào redux, dùng MiddleWare createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
	"activeBoard/fetchBoardDetailsAPI",
	async (boardId) => {
		const response = await authorizeAxiosInstance.get(
			`${API_ROOT}/v1/boards/${boardId}`
		)
		// Luu ý: axios sẽ trả về kết quả qua property của nó là data
		return response.data
	}
)

// Khởi tạo một slice trong kho lưu trữ redux
export const activeBoardSlice = createSlice({
	name: "activeBoard",
	initialState,
	// Reduces: nơi xủ lý dữ liệu đồng bộ
	reducers: {
		updateCurrentActiveBoard: (state, action) => {
			const board = action.payload

			// Xử lý dữ liệu nếu cần thiết
			// ...

			//Update lại dữ liệu của currentActiveBoard
			state.currentActiveBoard = board
		},
		updateCardInBoard: (state, action) => {
			// Update nested data
			const incomingCard = action.payload

			// Tìm dần từ board đến column rồi đến card
			const column = state.currentActiveBoard.columns.find(
				(i) => i._id === incomingCard.columnId
			)
			if (column) {
				const card = column.cards.find((i) => i._id === incomingCard._id)
				if (card) {
					// card.title = incomingCard.title

          /**
          * Dùng Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một Array
          rồi forEach nó ra.
          * Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn không thì cập nhật ngược lại giá trị vào
          card luôn như bên dưới.
          */
          Object.keys(incomingCard).forEach(key => {
            card[key] = incomingCard[key]
          })
				}
			}
		}
	},
	// ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
	extraReducers: (builder) => {
		builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
			// action.payload ở đây chính là cái response.data trả về ở trên
			let board = action.payload

			// Thành viên trong board  sẽ gộp lại của 2 mảng owners và members
			board.FE_allUsers = board.owners.concat(board.members)

			// Xử lý dữ liệu nếu cần thiết
			board.columns = mapOrder(board.columns, board.columnOrderIds, "_id")
			board.columns.forEach((column) => {
				if (isEmpty(column.cards)) {
					column.cards = [generatePlaceholderCard(column)]
					column.cardOrderIds = [generatePlaceholderCard(column)._id]
				} else {
					column.cards = mapOrder(column.cards, column.cardOrderIds, "_id")
				}
			})

			//Update lại dữ liệu của currentActiveBoard
			state.currentActiveBoard = board
		})
	}
})

// Action là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập
// nhật lại dữ liệu thông qua reducer

// property actions là được redux tự động tạo theo tên của reducer
export const { updateCurrentActiveBoard, updateCardInBoard } =
	activeBoardSlice.actions

// Selectors: là nơi dành cho các componentd bên dưới được gọi bằng hook useSelector()
// để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
	return state.activeBoard.currentActiveBoard
}

export const activeBoardReducer = activeBoardSlice.reducer
