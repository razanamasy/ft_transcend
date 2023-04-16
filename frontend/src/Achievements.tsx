import Table from 'react-bootstrap/Table';
import { useState, useEffect} from 'react';
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate';
import './styles/MatchHistory.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

interface	achievement
{
	name: string;
	description: string;
};

export const Achievements = () => {

	const { auth } = useAuth();
	const axiosPrivate = useAxiosPrivate();

	const [lstachievement, setlstachievement] = useState<achievement[]>([]);

	useEffect(() =>
	{
		loadachievements();

	}, [])


	const loadachievements = async () =>
	{
		const ret = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/pong/getAchievements/",
		JSON.stringify({name : auth.name}),
		{
			withCredentials : true,
			headers:
			{
				'Content-Type' : 'application/json'
			}
		});
		setlstachievement(ret.data);
	}

	const dispach = lstachievement?.map(
		(ach, i) =>
		<Card key={i}>
			<Card.Body>
				<Card.Title>{ach.name}</Card.Title>
				<Card.Text>
					{ach.description}
				</Card.Text>
			</Card.Body>
		</Card>
	);
	return (
		<Container>
			<br/>
			<Row>
				{dispach}
			</Row>
		</Container>
	);

}
