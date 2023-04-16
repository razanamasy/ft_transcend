import { useState, useEffect} from 'react';
import { useAuth } from './hook/useAuth';
import { useSocket } from './hook/useSocket';
import useAxiosPrivate from './hook/useAxiosPrivate';
import { useLocation, useNavigate } from "react-router-dom";

//Dashboard
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import './styles/SearchForMatch.css';

export const SearchForMatch = (props: any) => {

	const axiosPrivate = useAxiosPrivate();
	const location = useLocation();
	const navigate = useNavigate();
	const { isInviter } = useAuth();
	const { auth } = useAuth();
	const { inInviteProcess} = useAuth();
	const {socketPong} = useSocket();
	const [search, setSearch] = useState(false);
	
	//HANDELING THE CLICK ON A GAME:
	// CA MARCHE AUX CONSOLE LOG DU BACK les bonnes room join et leave
	const handleSearchOpponent = async (e: any) => {

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
			setSearch(!search);
			if (!search)
				setTimeout(function () {socketPong.emit("SearchForPlayer", {user: auth.name})}, 3000)
			else
				socketPong.emit("SearchForPlayer", {user: auth.name})
		}
	}

	
	//FIND A GAME PLAYER1
	useEffect(() => {
		// ...
		socketPong.on('FoundAGame1', (data: any) => {
				setTimeout(function () {window.location.reload()}, 2000);
		})

		return () => {
			socketPong.off('FoundAGame');
		};
	}, []);

	//FIND A GAME PLAYER2
	useEffect(() => {
		// ...
		socketPong.on('FoundAGame2', (data: any) => {

				setTimeout(function () {window.location.reload()}, 4000);
		})

		return () => {
			socketPong.off('FoundAGame');
		};
	}, []);

	return (
		<div>
			<h2>Search for a player ! </h2>
				{
								search ?
								<div>
									<Button className="search-button" variant="outline-primary" onClick={handleSearchOpponent} >Stop Searching</Button> 
									<Spinner animation="grow" />
								</div>
									:
								<Button variant="primary" onClick={handleSearchOpponent}>Search</Button>
				}
		</div>
);	
}
