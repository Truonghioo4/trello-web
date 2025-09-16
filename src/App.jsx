import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Board from "./pages/Boards/_id.jsx";
import NotFound from "./pages/404/NotFound.jsx";
import Auth from "./pages/Auth/Auth.jsx";
import AccountVerification from "./pages/Auth/AccountVerification.jsx";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "~/redux/user/userSlice";
import Settings from "./pages/Settings/Settings.jsx";
import Boards from "~/pages/Boards/index.jsx";

/**
 * Giải pháp Clean Code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập
 * Sử dụng <Outlet /> của react-router-dom để hiển thị các Child Route (xem cách sử dụng trong App() bên dưới)
 * https://reactrouter.com/en/main/components/outlet
 * Một bài hướng dẫn khá đầy đủ:
 * https://www.robinwieruch.de/react-router-private-routes/
 */
const ProtectedRoute = ({ user }) => {
	if (!user) return <Navigate to="/login" replace={true} />;
	return <Outlet />;
};
const App = () => {
	const currentUser = useSelector(selectCurrentUser);

	return (
		<Routes>
			{/* Redirect Route */}
			<Route path="/" element={<Navigate to="boards" replace={true} />} />

			{/* Protected Routes (Hiểu đơn giản trong dự án của chúng ta là những route chỉ cho truy cập sau khi đã login) */}
			<Route element={<ProtectedRoute user={currentUser} />}>
				{/* <Outlet /> của react-router-dom sẽ chạy vào các child route trong này */}
				{/* Board Detail */}
				<Route path="/boards/:boardId" element={<Board />} />
				<Route path="/boards" element={<Boards />} />

				{/* User setting */}
				<Route path="/settings/account" element={<Settings />} />
				<Route path="/settings/security" element={<Settings />} />
			</Route>

			{/* 404 Not Found Page  */}
			<Route path="*" element={<NotFound />} />

			{/* Authentication */}
			<Route path="/login" element={<Auth />} />
			<Route path="/register" element={<Auth />} />
			<Route path="/account/verification" element={<AccountVerification />} />
		</Routes>
	);
};

export default App;
