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
import './styles/AchievementFriends.css'

interface	achievement
{
	name: string;
	description: string;
};

export const AchievementsFriends = (props: any) => {

	const axiosPrivate = useAxiosPrivate();
	const [info, setinfo] = useState<{level : number[], nbgame:number, nbwin:number}>({level:[], nbgame:0, nbwin:0});

	const [lstachievement, setlstachievement] = useState<achievement[]>([]);

			useEffect(() =>
			{
				loadachievements();

			}, [])


			const loadachievements = async ()  =>
			{
				const ret = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/pong/getAchievements/",
				JSON.stringify({name : props.friendName}),
				{
					withCredentials : true,
					headers:
					{
						'Content-Type' : 'application/json'
					}
				});
				setlstachievement(ret.data);
			}

			const dispach = lstachievement?.map((ach, i) =>
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
