import { useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ContentCut from "@mui/icons-material/ContentCut";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Cloud from "@mui/icons-material/Cloud";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tooltip from "@mui/material/Tooltip";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ListCards from "./ListCards/ListCards";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useConfirm } from "material-ui-confirm";
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from "~/apis";
import { cloneDeep } from "lodash";
import { selectCurrentActiveBoard, updateCurrentActiveBoard } from "~/redux/activeBoard/activeBoardSlice";
import { useDispatch, useSelector } from "react-redux";
import ToggleFocusInput from "~/components/Form/ToggleFocusInput";
const COLUMN_HEADER_HEIGHT = "50px";
const COLUMN_FOOTER_HEIGHT = "56px";

const Column = ({ column }) => {
	const dispatch = useDispatch()
	const board = useSelector(selectCurrentActiveBoard)

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: column?._id,
		data: { ...column }
	});

	const dndKitColumnSytles = {
		touchAction: "none",
		transform: CSS.Translate.toString(transform),
		transition,
		height: "100%",
		opacity: isDragging ? 0.5 : undefined
	};

	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const orderedCards = column.cards;

	const [openNewCardForm, setOpenNewCardForm] = useState(false);
	const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);

	const [newCardTitle, setNewCardTitle] = useState("");
	const addNewCard = async () => {
		if (!newCardTitle) {
			toast.error("Please enter column title", { position: "bottom-right" });
			return;
		}

		const newCardData = {
			title: newCardTitle,
			columnId: column._id
		};

		// Gọi API tạo mới card  và làm lại dữ liệu State Board
		const createdCard = await createNewCardAPI({
			...newCardData,
			boardId: board._id
		})

		// Cap nhat lai state board
		// const newBoard = { ...board }
		const newBoard = cloneDeep(board)
		const columnToUpdate = newBoard.columns.find((column) => column._id === createdCard.columnId)
		if (columnToUpdate) {
			if(columnToUpdate.cards.some(card=>card.FE_PlaceholderCard)){
				columnToUpdate.cards = [createdCard]
				columnToUpdate.cardOrderIds = [createdCard._id]
			}	else	{
				columnToUpdate.cards.push(createdCard)
				columnToUpdate.cardOrderIds.push(createdCard._id)
			}	
		}

		// setBoard(newBoard)
		dispatch(updateCurrentActiveBoard(newBoard))

		// Close add new column status & clear input
		toggleOpenNewCardForm();
		setNewCardTitle("");
	};

	// Xu ly xoa 1 column va card ben trong no
	const confirmDeleteColumn = useConfirm()
	const handleDeleteColumn= async ()=>{
		const { confirmed } = await confirmDeleteColumn({
			title: 'Delete Column?',
			description: 'This action will permanently delete your column and its Cards! Are you sure?',
			confirmationText: 'Confirm',
			cancellationText: 'Cancel',
			// allowClose: false,
			// dialogProps: {maxWidth: 'xs'},
			// confirmationButtonProps: { color: 'secondary', variant: 'outlined'},
			// cancellationButtonProps: {color: 'inherit'},

		})
		if(confirmed){
			const newBoard = { ...board }
			newBoard.columns = newBoard.columns.filter(c=>c._id !== column._id)
			newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id =>_id !== column._id)
			// setBoard(newBoard)
			dispatch(updateCurrentActiveBoard(newBoard))
			deleteColumnDetailsAPI(column._id).then(res=>{
				toast.success(res?.deleteResult)
			})
		}
	}

	const onUpdateColumnTitle = (newTitle) => {
		updateColumnDetailsAPI(column._id, {title: newTitle}).then(()=>{
			const newBoard = cloneDeep(board)
			const columnToUpdate = newBoard.columns.find((c) => column._id === c._id)
			if (columnToUpdate) columnToUpdate.title = newTitle
			// setBoard(newBoard)
			dispatch(updateCurrentActiveBoard(newBoard))
		})
	}
	return (
		<div ref={setNodeRef} style={dndKitColumnSytles} {...attributes}>
			<Box
				{...listeners}
				sx={{
					minWidth: "300px",
					maxWidth: "300px",
					bgcolor: (theme) => (theme.palette.mode === "dark" ? "#333643" : "#ebecf0"),
					ml: 2,
					borderRadius: "6px",
					height: "fit-content",
					maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`
				}}
			>
				{/* Header Column */}
				<Box
					sx={{
						height: COLUMN_HEADER_HEIGHT,
						p: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					}}
				>
					<ToggleFocusInput 
						value={column?.title}
						onChangedValue={onUpdateColumnTitle}
						data-no-dnd="true"
					/>
					<Box>
						<Tooltip title="More options">
							<ExpandMoreIcon
								id="basic-column-dropdown"
								aria-controls={open ? "basic-menu-column-dropdown" : undefined}
								aria-haspopup="true"
								aria-expanded={open ? "true" : undefined}
								onClick={handleClick}
								sx={{ color: "text.primary", cursor: "pointer" }}
							/>
						</Tooltip>
						<Menu
							id="basic-menu-column-dropdown"
							anchorEl={anchorEl}
							open={open}
							onClose={handleClose}
							onClick = {handleClose}
							slotProps={{
								list: {
            			'aria-labelledby': 'basic-column-dropdown',
          			},
							}}
						>
							<MenuItem 
								sx={{
										'&:hover': {
											color: 'success.light',
											'& .add-card-icon': {color: 'success.light'}
										}
								}}
								onClick={toggleOpenNewCardForm}
							>
								<ListItemIcon>
									<AddCardIcon className="add-card-icon" fontSize="small" />
								</ListItemIcon>
								<ListItemText>Add new card</ListItemText>
							</MenuItem>
							<MenuItem>
								<ListItemIcon>
									<ContentCut fontSize="small" />
								</ListItemIcon>
								<ListItemText>Cut</ListItemText>
							</MenuItem>
							<Divider />
							<MenuItem>
								<ListItemIcon>
									<Cloud fontSize="small" />
								</ListItemIcon>
								<ListItemText>Archive this column</ListItemText>
							</MenuItem>
							<MenuItem
								sx={{
									'&:hover': {
										color: 'warning.dark',
										'& .delete-forever-icon': {color: 'warning.dark'}
									}
								}}
								onClick={handleDeleteColumn}
							>
								<ListItemIcon>
									<DeleteForeverIcon className="delete-forever-icon" fontSize="small" />
								</ListItemIcon>
								<ListItemText>Delete this column</ListItemText>
							</MenuItem>
						</Menu>
					</Box>
				</Box>

				{/* List Card */}
				<ListCards cards={orderedCards} />

				{/* Footer Column */}
				<Box
					sx={{
						height: COLUMN_FOOTER_HEIGHT,
						p: 2
					}}
				>
					{!openNewCardForm ? (
						<Box
							sx={{
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between"
							}}
						>
							<Button startIcon={<AddCardIcon />} onClick={toggleOpenNewCardForm}>
								Add new card
							</Button>
							<Tooltip title="Drag to move">
								<DragHandleIcon sx={{ cursor: "pointer" }} />
							</Tooltip>
						</Box>
					) : (
						<Box
							sx={{
								height: "100%",
								display: "flex",
								alignItems: "center",
								gap: 1
							}}
						>
							<TextField
								label="Enter card title..."
								type="text"
								size="small"
								variant="outlined"
								autoFocus
								data-no-dnd="true"
								value={newCardTitle}
								onChange={(e) => setNewCardTitle(e.target.value)}
								sx={{
									"& label": { color: "text.primary" },
									"& input": {
										color: (theme) => theme.palette.primary.main,
										bgcolor: (theme) => (theme.palette.mode === "dark" ? "#333643" : "white")
									},
									"& label.Mui-focused": { color: (theme) => theme.palette.primary.main },
									"& .MuiOutlinedInput-root": {
										"& fieldset": { borderColor: (theme) => theme.palette.primary.main },
										"&:hover fieldset": { borderColor: (theme) => theme.palette.primary.main },
										"&.Mui-focused fieldset": {
											borderColor: (theme) => theme.palette.primary.main
										}
									},

									"& .MuiOutlinedInput-input": {
										borderRadius: 1
									}
								}}
							/>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Button
									className="interceptor-loading"
									onClick={addNewCard}
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
									Add
								</Button>
								<CloseIcon
									fontSize="small"
									sx={{
										color: (theme) => theme.palette.warning.light,
										cursor: "pointer"
									}}
									onClick={toggleOpenNewCardForm}
								/>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</div>
	);
};

export default Column;
