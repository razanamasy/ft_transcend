import Table from 'react-bootstrap/Table';
import { useState, useEffect} from 'react';
import useAxiosPrivate from './hook/useAxiosPrivate';
import './styles/MatchHistory.css';

export const MatchHistoryFriend = (props: any) => {

//Get info from global auth props

				const [gameList, setGameList] = useState([{player1: "", player2: "", status: 0, score1: 0, score2: 0, winner:"", nickname1: "", nickname2: "" }]);
		const axiosPrivate = useAxiosPrivate();

		useEffect(() => {

	//		let isMounted = true;
			//A REMPLACER AVEEC GET FRIENDZ
			const getEndedGame = async () => {
					try {
							const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/pong/endedGame/" + props.friendName);
							
							if (ret)
							{
								setGameList(ret.data);
							}	
					}
					catch (e) {
					}
			}

			getEndedGame();

			//In case getAll async funct called after the component mount
			//This cleanup fct reuns when it's unmount
		/*	return () => {
				isMounted = false;
			}*/
		}, [])



		return (
				<Table striped bordered hover variant="dark"  responsive>
						<thead>
								<tr>
										<th className="oddStrip" >#</th>
										<th className="oddStrip" >Player1</th>
										<th className="oddStrip" >Player2</th>
										<th className="oddStrip">Score</th>
								</tr>
						</thead>

						<tbody className="scrollable" >
								{
										gameList.map ?	
										gameList.map((info, index) => (
											<tr key={index} className="oddStrip" >
													<td className="oddStrip">{index}</td>
													{
														(info.winner == info.player1) ?
														<td className="oddStrip"><b>{info.nickname1}</b></td>
														:
														<td className="oddStrip">{info.nickname1}</td>
													}
													{
														(info.winner == info.player2) ?
														<td className="oddStrip"><b>{info.nickname2}</b></td>
														:
														<td className="oddStrip">{info.nickname2}</td>
													}
													{
														 (info.winner == 'time out') ?
														<td className="oddStrip">Time-out</td>
														:
														<td className="oddStrip">{info.score1}-{info.score2}</td>
													}
											</tr>
										))
										:

												<tr>
													{Array.from({ length: 3 }).map((_, index) => (
														<td key={index}>No match</td>
													))}
												</tr>

								}

						</tbody>


				</Table>
		);
}
