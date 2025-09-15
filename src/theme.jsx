import { createTheme } from "@mui/material/styles";
const APP_BAR_HEIGHT = "58px";
const BOARD_BAR_HEIGHT = "60px";
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`;
const theme = createTheme({
	trello: {
		appBarHeight: APP_BAR_HEIGHT,
		boardBarHeight: BOARD_BAR_HEIGHT,
		boardContentHeight: BOARD_CONTENT_HEIGHT,
	},
	colorSchemes: {
		light: {},
		dark: {},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					"*::-webkit-scrollbar": {
						width: "8px",
						height: "8px",
					},
					"*::-webkit-scrollbar-thumb": {
						backgroundColor: "#dcdde1",
						borderRadius: "8px",
					},
					"*::-webkit-scrollbar-thumb:hover": {
						backgroundColor: "white",
					},
				},
			},
		},

		MuiButton: {
			styleOverrides: {
				// Name of the slot
				root: {
					// Some CSS
					textTransform: "none",
					borderWidth: "0.5px",
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				// Name of the slot
				root: {
					fontSize: "0.875rem",
				},
			},
		},
		MuiTypography: {
			styleOverrides: {
				root: {
					"&.MuiTypography-body1": {
						fontSize: "0.875rem",
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					fontSize: "0.875rem",
					"& fieldset": { borderWidth: "0.5px !important" },
					"&:hover fieldset": { borderWidth: "1px !important" },
					"&.Mui-focused fieldset": { borderWidth: "1px !important" },
				},
			},
		},
	},
});

export default theme;
