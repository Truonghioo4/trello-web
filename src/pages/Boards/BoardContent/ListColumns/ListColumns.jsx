import { useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Column from "./Column/Column";
import Button from "@mui/material/Button";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { generatePlaceholderCard } from "~/utils/formatters.js"
import { createNewColumnAPI } from "~/apis/index.js"
import {  useSelector, useDispatch } from 'react-redux'
import { updateCurrentActiveBoard ,selectCurrentActiveBoard } from "~/redux/activeBoard/activeBoardSlice";
import {cloneDeep} from 'lodash'

const ListColumns = ({ columns }) => {
	const dispatch = useDispatch()
	const board = useSelector(selectCurrentActiveBoard)
	const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
	const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm);

	const [newColumnTitle, setNewColumnTitle] = useState("");
	const addNewColumn = async () => {
		if (!newColumnTitle) {
			toast.error("Please enter column title");
			return;
		}

		// Tạo dữ liệu column để gọi API
		const newColumnData = {
			title: newColumnTitle
		};

		// Gọi API tạo column và làm lại dữ liệu State Board
		const createdColumn = await createNewColumnAPI({
			...newColumnData,
			boardId: board._id
		}) 
		createdColumn.cards = [generatePlaceholderCard(createdColumn)]
		createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

		// Cap nhat lai state board
		const newBoard = cloneDeep(board)
		newBoard.columns.push(createdColumn)
		newBoard.columnOrderIds.push(createdColumn._id)
		dispatch(updateCurrentActiveBoard(newBoard))

		// Close add new column status & clear input
		toggleOpenNewColumnForm();
		setNewColumnTitle("");
	};
	return (
		<SortableContext items={columns?.map((c) => c._id)} strategy={horizontalListSortingStrategy}>
			<Box
				sx={{
					bgcolor: "inherit",
					width: "100%",
					height: "100%",
					display: "flex",
					overflowX: "auto",
					overflowY: "hidden",
					"&::-webkit-scrollbar-track": { m: 2 }
				}}
			>
				{columns?.map((column) => (
					<Column 
						key={column._id} 
						column={column} 
					/>
				))}

				{/* Add new column CTA */}
				{!openNewColumnForm ? (
					<Box
						onClick={toggleOpenNewColumnForm}
						sx={{
							minWidth: "250px",
							maxWidth: "250px",
							height: "fit-content",
							mx: 2,
							borderRadius: "6px",
							bgcolor: "#ffffff3d",
							ml: 2
						}}
					>
						<Button
							sx={{
								color: "white",
								width: "100%",
								justifyContent: "flex-start",
								pl: 2.5,
								py: 1
							}}
							startIcon={<NoteAddIcon />}
						>
							Add new column
						</Button>
					</Box>
				) : (
					<Box
						sx={{
							minWidth: "250px",
							maxWidth: "205px",
							mx: 2,
							p: 1,
							borderRadius: "6px",
							height: "fit-content",
							bgcolor: "#ffffff3d",
							display: "flex",
							flexDirection: "column",
							gap: 1
						}}
					>
						<TextField
							label="Enter column title..."
							type="text"
							size="small"
							variant="outlined"
							autoFocus
							value={newColumnTitle}
							onChange={(e) => setNewColumnTitle(e.target.value)}
							sx={{
								"& label": { color: "white" },
								"& input": { color: "white" },
								"& label.Mui-focused": { color: "white" },
								"& .MuiOutlinedInput-root": {
									"& fieldset": { borderColor: "white" },
									"&:hover fieldset": { borderColor: "white" },
									"&.Mui-focused fieldset": { borderColor: "white" }
								}
							}}
						/>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Button
								className="interceptor-loading"
								onClick={addNewColumn}
								variant="contained"
								color="success"
								size="small"
								sx={{
									boxShadow: "none",
									border: "0.5px solid",
									borderColor: (theme) => theme.palette.success.main,
									"&:hover": { bgcolor: (theme) => theme.palette.success.main }
								}}
							>
								Add Column
							</Button>
							<CloseIcon
								fontSize="small"
								sx={{
									color: "white",
									cursor: "pointer",
									"&:hover": { color: (theme) => theme.palette.warning.light }
								}}
								onClick={toggleOpenNewColumnForm}
							/>
						</Box>
					</Box>
				)}
			</Box>
		</SortableContext>
	);
};

export default ListColumns;
