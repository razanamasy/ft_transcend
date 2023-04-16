import { useState, useEffect} from 'react';
import { useAuth } from './hook/useAuth';
import { useSocket } from './hook/useSocket';
import useAxiosPrivate from './hook/useAxiosPrivate';

//Dashboard
import ListGroup from 'react-bootstrap/ListGroup';

export const ListOnGoingGame = (props: any) => {


	const { auth } = useAuth();
	const { socketPong } = useSocket()
	const [currentGame, setCurrentGame] = useState("");
	const [displayList, setDisplayList] = useState(false);

	const axiosPrivate = useAxiosPrivate();
				const [gameList, setGameList] = useState([{roomName: "", player1: "", player2:"", nickname1:"", nickname2:"", status: 0}]);

	
	//HANDELING THE CLICK ON A GAME:
	// CA MARCHE AUX CONSOLE LOG DU BACK les bonnes room join et leave
	const handleSpectateGame = async (e: any) => {

		const isInviteProcess = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/isInviteProcess/" + auth.name)
		const isInviter = isInviteProcess.data.isInviter;
		const isInvited = isInviteProcess.data.isInvited;
		if (isInviter)
		{
			props.setShow(true);
		}
		else if (isInvited)
		{
			props.setShowDecline(true);
		}
		else
		{
				const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/pong/onGoingGamesByRoom/" + e.target.getAttribute("data-index"));
				if (ret?.data[0])
				{
					if (ret?.data[0]?.msg == 'no games')
					{
						window.alert("This game is already over");
					}
					else
					{
						props.setGameInfo(ret.data[0]);
						if (currentGame.length)
						{
							socketPong.emit('leavePongRoom', {myPongRoom: currentGame});
						}
						setCurrentGame(ret.data[0].roomName);
						socketPong.emit('joinMyPongRoom', {myPongRoom:ret.data[0].roomName })
					}
				}

		}
	}

	//USE EFFECT THAT FETCH THE LIST OF TOTAL ON GOING GAMES
	useEffect(() => {
		const controller = new AbortController();
		const getGames = async () => {
			if (!auth.name)
					return ;
			try {
				const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/pong/onGoingGames/",
							{
							//		signal: controller.signal,
							},
				);

				if (ret?.data[0]?.roomName == undefined)
				{
					setDisplayList(false);
				}	
				else
				{
					setDisplayList(true);
					setGameList(ret.data);
				}
			}
			catch (e) {
			}
		}
		getGames();
	}, [])




	return (
		<div>
			<h2>Watch Games</h2>
			{
				displayList ?
				(
					<ListGroup>
						{gameList.map((game, i) => <ListGroup.Item onClick={handleSpectateGame} data-index={game?.roomName}  key={i}>{game?.nickname1}/{game?.nickname2}</ListGroup.Item>)}
					</ListGroup>
				)
				:
					<p>No games</p>
			}
		</div>);	
}
