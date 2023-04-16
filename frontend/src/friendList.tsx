import { useState, useEffect} from 'react';
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate';
import { useNavigate } from "react-router-dom";

//Dashboard
import ListGroup from 'react-bootstrap/ListGroup';

export const FriendList = () => {


				const navigate = useNavigate();

				const { auth } = useAuth();
				const axiosPrivate = useAxiosPrivate();
				const [users, setUsers] = useState([{name: "", nickname: "",  enable2FA: false}]);

				const navFriendDashboard = (e: any) => {
						navigate("Friend/" + e.target.getAttribute("data-index"),)	
				}



				useEffect(() => {
					let isMounted = true;
					const controller = new AbortController();
					//A REMPLACER AVEEC GET FRIENDZ
					const getAllFriends = async () => {
							try {
										const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/friends/" + auth.name, 
														{
																params: { name: auth.name },
																signal: controller.signal,
														},
										);
									//if not Mount, we don't set user
									if (isMounted)
										setUsers(ret.data);
							}
							catch (e) {
							}
					}

					getAllFriends();

					//In case getAll async funct called after the component mount
					//This cleanup fct reuns when it's unmount
					return () => {
						isMounted = false;
						controller.abort();
					}
				}, [])




				return (
			<div className="friendList">
							{
											users?.length ?
											(
															<ListGroup>
																{users.map((user, i) => <ListGroup.Item variant="dark"  onClick={navFriendDashboard} data-index={user?.name}  key={i}>{user?.nickname}</ListGroup.Item>)}
														    </ListGroup>
											)
											:
											<p>No user to display here</p>
							}
			</div>);		
}
