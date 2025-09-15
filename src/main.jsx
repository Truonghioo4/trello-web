import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import CssBaseline from "@mui/material/CssBaseline"
import GlobalStyles from "@mui/material/GlobalStyles"
import { ThemeProvider } from "@mui/material/styles"
import theme from "./theme.jsx"

// Cấu hình react-toastify
import { ToastContainer } from "react-toastify"
// Cấu hình MUI Dialog
import { ConfirmProvider } from "material-ui-confirm"
// Cấu hình redux store
import { Provider } from "react-redux"
import { store } from './redux/store.js'

// Cấu hình react router dom với Browser Router
import {BrowserRouter} from 'react-router-dom'

// Cấu hình Redux-Persist
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
const persistor = persistStore(store)

// Kĩ thuật inject store :là kĩ thuật khi cần sử dụng biến redux ở các file ngoài phạm vi component
import { injectStore } from '~/utils/authorizeAxios.js'
injectStore(store)

createRoot(document.getElementById("root")).render(
	<BrowserRouter basename="/">
		<Provider store={store}>
			<PersistGate persistor={persistor}>
				<ThemeProvider theme={theme}>
					<ConfirmProvider defaultOptions={{
						allowClose: false,
						dialogProps: {maxWidth: 'xs'},
						confirmationButtonProps: { color: 'secondary', variant: 'outlined'},
						cancellationButtonProps: {color: 'inherit'}
					}}>
						<GlobalStyles styles={{ a: { textDecoration: 'none' } }}/>
						<CssBaseline />
						<App />
						<ToastContainer position="bottom-left" theme="colored" />
					</ConfirmProvider>
				</ThemeProvider>
			</PersistGate>
		</Provider>
	</BrowserRouter>
)
