import Box from "@mui/material/Box"
import ListColumns from "./ListColumns/ListColumns"
import {
	DndContext,
	// PointerSensor,
	// MouseSensor,
	// TouchSensor,
	useSensor,
	useSensors,
	DragOverlay,
	defaultDropAnimationSideEffects,
	closestCorners,
	closestCenter,
	pointerWithin,
	// rectIntersection,
	getFirstCollision
} from "@dnd-kit/core"
import { MouseSensor, TouchSensor } from "~/customLibraries/DndKitSensors"
import { arrayMove } from "@dnd-kit/sortable"
import { useCallback, useEffect, useRef, useState } from "react"
import { cloneDeep, isEmpty } from "lodash"
import { generatePlaceholderCard } from "~/utils/formatters"

import Column from "./ListColumns/Column/Column"
import Card from "./ListColumns/Column/ListCards/Card/Card"

const ACTIVE_DRAG_ITEM_TYPE = {
	COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
	CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD"
}

const BoardContent = ({
	board,
	moveColumns,
	moveCardInTheSameColumn,
	moveCardToDifferentColumn,
}) => {
	// const pointerSensor = useSensor(PointerSensor, {
	// 	activationConstraint: { distance: 10 },
	// })
	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: { distance: 10 }
	})
	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: { delay: 250, tolerance: 500 }
	})
	// const sensors = useSensors(pointerSensor)
	const sensors = useSensors(mouseSensor, touchSensor)

	const [orderedColumns, setOrderedColumns] = useState([])

	const [activeDragItemId, setActiveDragItemId] = useState(null)
	const [activeDragItemType, setActiveDragItemType] = useState(null)
	const [activeDragItemData, setActiveDragItemData] = useState(null)
	const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

	const lastOverId = useRef(null)

	useEffect(() => {
		setOrderedColumns(board.columns)
	}, [board])

	const findColumnByCardId = (cardId) => {
		return orderedColumns.find((column) => column.cards.map((card) => card._id)?.includes(cardId))
	}

	const moveCardBetweenDifferentColumns = (
		overColumn,
		overCardId,
		active,
		over,
		activeColumn,
		activeDraggingCardId,
		activeDraggingCardData,
		triggerFrom
	) => {
		setOrderedColumns((prev) => {
			// Tim vi tri cua overCard trong column dich noi ma sap duoc tha
			const overCardIndex = overColumn?.cards?.findIndex((card) => card._id === overCardId)
			let newCardIndex
			const isBelowOverItem =
				active.rect.current.translated &&
				active.rect.current.translated.top > over.rect.top + over.rect.height
			const modifier = isBelowOverItem ? 1 : 0
			newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

			const nextColumns = cloneDeep(prev)
			const nextActiveColumn = nextColumns.find((c) => c._id === activeColumn._id)
			const nextOverColumn = nextColumns.find((c) => c._id === overColumn._id)

			// Column cũ
			if (nextActiveColumn) {
				// Xoa card di
				nextActiveColumn.cards = nextActiveColumn.cards.filter(
					(card) => card._id !== activeDraggingCardId
				)

				if (isEmpty(nextActiveColumn.cards)) {
					nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
				}

				// Cap nhat lai mang card
				nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((card) => card._id)
			}

			// Column mới
			if (nextOverColumn) {
				// Kiem tra xem card dang keo co ton tai trong overColumn chua, neu co thi xoa no truoc
				nextOverColumn.cards = nextOverColumn.cards.filter(
					(card) => card._id !== activeDraggingCardId
				)

				const rebuild_activeDraggingCardData = {
					...activeDraggingCardData,
					columnId: nextOverColumn._id
				}
				//them card dang keo vao overColumn theo vi tri index moi
				nextOverColumn.cards = nextOverColumn.cards.toSpliced(
					newCardIndex,
					0,
					rebuild_activeDraggingCardData
				)

				nextOverColumn.cards = nextOverColumn.cards.filter((card) => !card.FE_PlaceholderCard)

				// Cap nhat lai mang card
				nextOverColumn.cardOrderIds = nextOverColumn.cards.map((card) => card._id)
			}

			if(triggerFrom=== 'handleDragEnd'){
				moveCardToDifferentColumn(
					activeDraggingCardId, 
					oldColumnWhenDraggingCard._id, 
					nextOverColumn._id, 
					nextColumns 
				)
			}
			return nextColumns
		})
	}
	const handleDragStart = (e) => {
		setActiveDragItemId(e?.active?.id)
		setActiveDragItemType(
			e?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN
		)
		setActiveDragItemData(e?.active?.data?.current)

		// Neu la keo card thi moi thuc hien hanh dong set gia tri
		if (e?.active?.data?.current?.columnId) {
			setOldColumnWhenDraggingCard(findColumnByCardId(e?.active?.id))
		}
	}

	// Trigger trong qua trinh keo (Drag) mot phan tu
	const handleDragOver = (e) => {
		// Khong lmj them neu nhu dang keo (Drag) column
		if (activeDragItemType === activeDragItemType.COLUMN) return

		// Còn nếu kéo card thì xử lí thêm để có thể kéo qua các column
		// console.log("handleDragOver", e)
		const { active, over } = e

		// Kiểm tra nếu không tồn tại over khi kéo lunh tinh thì return tránh lỗi
		if (!active || !over) return

		// activeDraggingCard là cái card chúng ta đang kéo
		const {
			id: activeDraggingCardId,
			data: { current: activeDraggingCardData }
		} = active
		// overCard là card đang tương tác trên hoặc dưới so với card được kéo
		const { id: overCardId } = over

		// Tìm 2 column theo cardId
		const activeColumn = findColumnByCardId(activeDraggingCardId)
		const overColumn = findColumnByCardId(overCardId)

		// Neu khong ton tai mot trong 2 column thi khong lam gi het
		if (!activeColumn || !overColumn) return

		if (activeColumn._id !== overColumn._id) {
			moveCardBetweenDifferentColumns(
				overColumn,
				overCardId,
				active,
				over,
				activeColumn,
				activeDraggingCardId,
				activeDraggingCardData,
				"handleDragOver"
			)
		}
	}

	const handleDragEnd = (e) => {
		const { active, over } = e
		if (!active || !over) return

		// Xu ly keo tha card
		if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
			const {
				id: activeDraggingCardId,
				data: { current: activeDraggingCardData }
			} = active
			// overCard là card đang tương tác trên hoặc dưới so với card được kéo
			const { id: overCardId } = over

			// Tìm 2 column theo cardId
			const activeColumn = findColumnByCardId(activeDraggingCardId)
			const overColumn = findColumnByCardId(overCardId)

			// Neu khong ton tai mot trong 2 column thi khong lam gi het
			if (!activeColumn || !overColumn) return

			if (oldColumnWhenDraggingCard._id !== overColumn._id) {
				moveCardBetweenDifferentColumns(
					overColumn,
					overCardId,
					active,
					over,
					activeColumn,
					activeDraggingCardId,
					activeDraggingCardData,
					"handleDragEnd"
				)
			} else {
				// Lay Vi tri cu tu thang active
				const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
					(c) => c._id === activeDragItemId
				)
				// Lay Vi tri moi tu thang over
				const newCardIndex = overColumn?.cards?.findIndex((c) => c._id === overCardId)
				const dndOrderedCards = arrayMove(
					oldColumnWhenDraggingCard?.cards,
					oldCardIndex,
					newCardIndex
				)
				const dndOrderedCardIds = dndOrderedCards.map((c) => c._id)

				setOrderedColumns((prev) => {
					const nextColumns = cloneDeep(prev)
					const targetColumn = nextColumns.find((c) => c._id === overColumn._id)
					targetColumn.cards = dndOrderedCards
					targetColumn.cardOrderIds = dndOrderedCardIds
					return nextColumns
				})

				moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
			}
		}

		// Xu ly keo tha column
		if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
			if (active.id !== over.id) {
				// Lay Vi tri cu tu thang active
				const oldColumnIndex = orderedColumns.findIndex((c) => c._id === active.id)
				// Lay Vi tri moi tu thang over
				const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id)
				const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)

				setOrderedColumns(dndOrderedColumns)
				moveColumns(dndOrderedColumns)
			}
		}

		setActiveDragItemData(null)
		setActiveDragItemId(null)
		setActiveDragItemType(null)
		setOldColumnWhenDraggingCard(null)
	}

	const dropAnimation = {
		sideEffects: defaultDropAnimationSideEffects({
			styles: {
				active: {
					opacity: "0.5"
				}
			}
		})
	}

	const collisionDetectionStrategy = useCallback(
		(args) => {
			if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
				return closestCorners({ ...args })
			}

			const pointerIntersecsions = pointerWithin(args)
			if (!pointerIntersecsions?.length) return

			// const intersecsions =
			// 	pointerIntersecsions.length > 0 ? pointerIntersecsions : rectIntersection(args)
			let overId = getFirstCollision(pointerIntersecsions, "id")
			if (overId) {
				const checkColumn = orderedColumns.find((column) => column._id === overId)
				if (checkColumn) {
					overId = closestCenter({
						...args,
						droppableContainers: args.droppableContainers.filter((container) => {
							return container.id !== overId && checkColumn?.cardOrderIds?.includes(container.id)
						})
					})[0]?.id
				}

				lastOverId.current = overId
				return [{ id: overId }]
			}

			return lastOverId.current ? [{ id: lastOverId.current }] : []
		},
		[activeDragItemType, orderedColumns]
	)

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			// collisionDetection={closestCorners}
			collisionDetection={collisionDetectionStrategy}
		>
			<Box
				sx={{
					bgcolor: (theme) => (theme.palette.mode === "dark" ? "#34495e" : "#1976d2"),
					width: "100%",
					height: (theme) => theme.trello.boardContentHeight,
					p: "10px 0"
				}}
			>
				<ListColumns
					columns={orderedColumns}
				/>
				<DragOverlay dropAnimation={dropAnimation}>
					{!activeDragItemType && null}
					{activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
						<Column column={activeDragItemData} />
					)}
					{activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && <Card card={activeDragItemData} />}
				</DragOverlay>
			</Box>
		</DndContext>
	)
}

export default BoardContent
