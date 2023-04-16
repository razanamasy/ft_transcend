import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hook/useAuth";


export const RequireAuth = () => {

				const { auth } = useAuth();
				const location = useLocation();


				return (auth?.name?.length
									? <Outlet />
								: <Navigate to="/login" state={{from: location}} replace/>);
}
