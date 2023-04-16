import { Outlet } from 'react-router-dom';
import { useEffect, useState, useRef } from "react";
import { userApi } from './api/user.api';
import { useAuth } from './hook/useAuth';
import { useSocket } from './hook/useSocket';
import Spinner from 'react-bootstrap/Spinner';
import {NavBar} from './NavBar';

export const PersistLogin = () => {

		const {socket} = useSocket();
		//	const socket = useContext(SocketContext);
		const {socketPong} = useSocket();
		const {socketConnexion} = useSocket();
		const { setAuth } = useAuth();

		const { modeInvitation } = useAuth();
		const { setModeInvitation } = useAuth();

		const { myInvited } = useAuth();
		const { setMyInvited } = useAuth();

		const { myInviter } = useAuth();
		const { setMyInviter } = useAuth();

		const { setIsInvited } = useAuth();

		const { setIsInviter } = useAuth();

		const { setInInviteProcess } = useAuth();

		const { auth } = useAuth();

		const [load, setLoad] = useState(true);

//	const navigate = useNavigate();


    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

		useEffect( () => {
				const checkToken = async () => {
						try {
							//	socketConnexion.emit('changestatus', {name: info.name, status:info.status});
								const userInfo = await userApi.getRefreshToken();
								socketPong.emit('StopSearchForPlayer', {user: userInfo.data.name});

										setAuth({name: userInfo.data.name, nickname: userInfo.data.nickname, enable2FA: userInfo?.data?.enable2FA, passLog: true});

								setModeInvitation(userInfo.data.modeGameInvitation);

								setMyInviter(userInfo.data.myInviter);
								setMyInvited(userInfo.data.myInvited);

								setIsInvited(userInfo.data.isInvited);
								setIsInviter(userInfo.data.isInviter);

								setInInviteProcess(userInfo.data.inInviteProcess);

									if (userInfo.data.name.length)
									{
										if (!socketPong.connected)
										{
											window.location.reload();
										}

										socket.emit('Connexion', {username: userInfo.data.name});
										socketPong.emit('Connexion', {username: userInfo.data.name});
										socketConnexion.emit('Connexion', {username: userInfo.data.name});
									}

						} 
						catch (e) {
						//		navigate('/Login', {state:{isAccepted:true}}) // SURE ??
						}
						finally {
								setLoad(false);
						}

				}

				checkToken();

		}, [])


		return (
				<div>

								{/*	<LoadBarOne/>*/}
						{
										load 
										?
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
										:
										<div>
										<NavBar/>
										<Outlet/>
										</div>
						}

				</div>
		)
}
