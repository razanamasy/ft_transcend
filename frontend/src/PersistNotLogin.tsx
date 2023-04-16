import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import {  useEffect, useState } from "react";
import { userApi } from './api/user.api';
import { useAuth } from './hook/useAuth';
import {Dashboard} from './Dashboard';
import {NavBar} from './NavBar';
import { useSocket } from './hook/useSocket';
import Spinner from 'react-bootstrap/Spinner';




export const PersistNotLogin = () => {

		const {socket} = useSocket();
		const {socketPong} = useSocket();
		const { setAuth } = useAuth();

		const {socketConnexion} = useSocket();
		const { modeInvitation } = useAuth();
		const { setModeInvitation } = useAuth();

		const { setMyInvited } = useAuth();

		const { setMyInviter } = useAuth();

		const { setIsInvited } = useAuth();

		const { setIsInviter } = useAuth();

		const { setInInviteProcess } = useAuth();
		
		const { auth } = useAuth();
		const oldLogin = auth.name;
		const [load, setLoad] = useState(true);
		const location = useLocation();
	const navigate = useNavigate();


				useEffect( () => {
							const checkToken = async () => {
										try {
													const userInfo = await userApi.getRefreshToken();

													if (userInfo.data.msg == 'error')
													{
															setLoad(false);
															return;
													}

													socketPong.emit('StopSearchForPlayer', {user: userInfo.data.name});

													setAuth({name: userInfo.data.name, nickname: userInfo.data.nickname, enable2FA: false, passLog: true});

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
												//	setAuth({name: "TEST", enable2FA: false, passLog: true});
										} 
										catch (e) {
											//	navigate('/Login')
										}
										finally {
												setLoad(false);
										}
										
							}

							checkToken();

				}, [])


				return (

							<div>
											{ load 
											?
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>							
										:
													<div>
													{
														auth?.name ?
														<div>
															<NavBar/>
															<Dashboard/>
														</div>
														:
															<Outlet/>
													}
													</div>
											}

							</div>
				)
}
