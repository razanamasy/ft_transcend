import { useState, useEffect} from 'react';
import {MatchHistoryFriend} from './MatchHistoryFriend';
import {HeaderFriends} from './HeaderFriends';
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import {AchievementsFriends} from './AchievementFriends';
import { useLocation, useParams } from "react-router-dom";
import {Missing} from './Missing';
import Spinner from 'react-bootstrap/Spinner';
import './styles/Dashboard.css'

import {
	Navigate,
} from "react-router-dom";

export const DashboardFriend = () => {


				const axiosPrivate = useAxiosPrivate();

				const { auth } = useAuth();
				let { friendName } = useParams();
			//	const [friendName, setFriendName] = useState(state.friendName);
				
				//Fetch friends info (a filtrer)
				const [friendInfo, setFriendInfo] = useState();
				const [notFound, setNotFound] = useState(true);
				const [isMounted, setIsMounted] = useState(true);


				useEffect(() => {
						
						const getOne = async () => {
									try {
												const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/" + friendName, 
																{
																		params: { name: friendName },
																},
												);
											if (ret?.data?.msg == 'not found')
											{
												setNotFound(true);
												setIsMounted(false);
											}
											else
											{
												setNotFound(false);
												if (isMounted)
													setFriendInfo(ret.data);
												setIsMounted(false);
											}
									}
									catch (e) {
											setNotFound(true);
											setIsMounted(false);
									}
						}

						getOne();

				}, [])		


			return (
			<div  className="smallContainer">
					{
						isMounted  
							?
							<div>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
							</div>
							:
							<div>
								{
									notFound ?
										<div>
														<h2>User {friendName} doesn't exist</h2>	
										</div>
									:
											<div>
												{
														auth.name == friendName ?
														<Navigate to="/Dashboard" />
														:
														<div>
																<HeaderFriends friendName={friendName} /> 
																<Tabs
																	defaultActiveKey="matchHistory"
																	transition={false}
																	id="noanim-tab-example"
																>
																	<Tab className="test" eventKey="matchHistory" title="Match History">
																			<MatchHistoryFriend friendName={friendName}/> 
																	</Tab>
																	<Tab eventKey="achievements" className="test" title="Achievements">
																			<AchievementsFriends friendName={friendName}/>
																	</Tab>
																</Tabs>
														</div>
													}
											</div>
												}
							</div>
					}
			</div>






			);
}
