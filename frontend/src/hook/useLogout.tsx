import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import useAxiosPrivate from '../hook/useAxiosPrivate';

export const useLogout = () => {

	const axiosPrivate = useAxiosPrivate();
	const { socket } = useSocket();
	const { socketPong } = useSocket();
	const { setAuth } = useAuth();
	const { auth } = useAuth();

	const Logout = async () => {
		await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/logout")
		setAuth({nickname: '', name: '', enable2FA: false, passLog: false});
	}
	return Logout;
}
