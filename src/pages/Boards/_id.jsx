import Container from "@mui/material/Container"
import AppBar from "../../components/AppBar/AppBar.jsx"
import BoardBar from "./BoardBar/BoardBar.jsx"
import BoardContent from "./BoardContent/BoardContent.jsx"
import { useEffect } from "react"
import {
	updateBoardDetailsAPI,
	updateColumnDetailsAPI,
	moveCardToDifferentColumnAPI
} from "~/apis/index.js"
// import { mockData } from "~/apis/mock-data.js"
import {
	fetchBoardDetailsAPI,
	updateCurrentActiveBoard,
	selectCurrentActiveBoard
} from "../../redux/activeBoard/activeBoardSlice.js"
import { useDispatch, useSelector } from "react-redux"
import { cloneDeep } from "lodash"
import { useParams } from "react-router-dom"
import PageLoadingSpinner from "~/components/Loading/PageLoadingSpinner.jsx"
import ActiveCard from "~/components/Modal/ActiveCard/ActiveCard.jsx"
const Board = () => {
	const dispatch = useDispatch()
	// const [board, setBoard] = useState(null)
	const board = useSelector(selectCurrentActiveBoard)
	const { boardId } = useParams()

	useEffect(() => {
		// Call apis
		dispatch(fetchBoardDetailsAPI(boardId))
	}, [dispatch, boardId])

	const moveColumns = (dndOrderedColumns) => {
		const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
		// Cap nhat lai state board
		const newBoard = { ...board }
		newBoard.columns = dndOrderedColumns
		newBoard.columnOrderIds = dndOrderedColumnsIds
		// setBoard(newBoard)
		dispatch(updateCurrentActiveBoard(newBoard))

		updateBoardDetailsAPI(newBoard._id, {
			columnOrderIds: newBoard.columnOrderIds
		})
	}

	const moveCardInTheSameColumn = (
		dndOrderedCards,
		dndOrderedCardIds,
		columnId
	) => {
		// const newBoard = { ...board }
		const newBoard = cloneDeep(board)
		const columnToUpdate = newBoard.columns.find(
			(column) => column._id === columnId
		)
		if (columnToUpdate) {
			columnToUpdate.cards = dndOrderedCards
			columnToUpdate.cardOrderIds = dndOrderedCardIds
		}
		// setBoard(newBoard)
		dispatch(updateCurrentActiveBoard(newBoard))

		updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
	}

	const moveCardToDifferentColumn = (
		currentCardId,
		prevColumnId,
		nextColumnId,
		dndOrderedColumns
	) => {
		const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
		// Cap nhat lai state board
		const newBoard = { ...board }
		newBoard.columns = dndOrderedColumns
		newBoard.columnOrderIds = dndOrderedColumnsIds
		// setBoard(newBoard)
		dispatch(updateCurrentActiveBoard(newBoard))

		// Call API hanlde side of backend
		let prevCardOrderIds = dndOrderedColumns.find(
			(c) => c._id === prevColumnId
		)?.cardOrderIds
		if (prevCardOrderIds[0].includes("placeholder-card")) prevCardOrderIds = []
		moveCardToDifferentColumnAPI({
			currentCardId,
			prevColumnId,
			prevCardOrderIds,
			nextColumnId,
			nextCardOrderIds: dndOrderedColumns.find((c) => c._id === nextColumnId)
				?.cardOrderIds
		})
	}

	if (!board) {
		return <PageLoadingSpinner caption="Loading Board..." />
	}
	return (
		<div>
			<Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
				{/* Modal Active Card, check đóng/mở dựa theo State isShowModalActiveCard luu trong redux */}
				<ActiveCard />
				<AppBar />
				<BoardBar board={board} />
				<BoardContent
					board={board}
					moveColumns={moveColumns}
					moveCardInTheSameColumn={moveCardInTheSameColumn}
					moveCardToDifferentColumn={moveCardToDifferentColumn}
				/>
			</Container>
		</div>
	)
}

export default Board
