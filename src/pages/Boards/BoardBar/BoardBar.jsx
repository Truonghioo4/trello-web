import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import DashboardIcon from "@mui/icons-material/Dashboard"
import VpnLockIcon from "@mui/icons-material/VpnLock"
import AddToDrive from "@mui/icons-material/AddToDrive"
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt"
import FilterListIcon from "@mui/icons-material/FilterList"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import { capitalizeFirstLetter } from "~/utils/formatters"
import BoardUserGroup from "./BoardUserGroup"
const MENI_STYLES = {
	color: "white",
	bgcolor: "transparent",
	border: "none",
	paddingX: "5px",
	borderRadius: "4px",
	".MuiSvgIcon-root": {
		color: "white",
	},
	"&:hover": {
		bgcolor: "primary.50",
	},
}
const BoardBar = ({ board }) => {
	return (
		<Box
			sx={{
				width: "100%",
				height: (theme) => theme.trello.boardBarHeight,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				paddingX: 2,
				gap: 2,
				overflowX: "auto",
				bgcolor: (theme) => (theme.palette.mode === "dark" ? "#2c3e50" : "#1976d2"),
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
				<Tooltip title={board?.description}>
					<Chip sx={MENI_STYLES} clickable icon={<DashboardIcon />} label={board?.title} />
				</Tooltip>

				<Chip
					sx={MENI_STYLES}
					clickable
					icon={<VpnLockIcon />}
					label={capitalizeFirstLetter(board?.type)}
				/>
				<Chip sx={MENI_STYLES} clickable icon={<AddToDrive />} label="Add To Google Drive" />
				<Chip sx={MENI_STYLES} clickable icon={<ElectricBoltIcon />} label="Automation" />
				<Chip sx={MENI_STYLES} clickable icon={<FilterListIcon />} label="Filter" />
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
				<Button
					sx={{
						color: "white",
						borderColor: "white",
						"&:hover": { borderColor: "white" },
					}}
					variant="outlined"
					startIcon={<PersonAddIcon />}
				>
					Invited
				</Button>
				<BoardUserGroup boardUsers={board?.FE_allUsers}/>
			</Box>
		</Box>
	)
}

export default BoardBar
