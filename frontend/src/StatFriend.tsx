import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useAxiosPrivate from './hook/useAxiosPrivate';
import './styles/Stats.css';

export const StatFriend = (props: any) => {

	const axiosPrivate = useAxiosPrivate();



			const [info, setinfo] = useState<{level : number[], nbgame:number, nbwin:number}>({level:[], nbgame:0, nbwin:0});

			useEffect(() =>
			{
				loadinfo();

			}, [])

			const loadinfo = async () =>
			{
				const ret = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/pong/getStats/",
				JSON.stringify({name : props.friendName}),
				{
					withCredentials : true, 
					headers:
					{
						'Content-Type' : 'application/json'
					}
				});
				setinfo(ret.data);
			}



				return (
						<Container>
							<Row>
								<Col>
												<div>🌟</div>
												<br/>
												<h1>	{info.nbwin} </h1>
												<br/>
												<h4>	VICTORY</h4>
								</Col>
								<Col>
												<div>🎮</div>
												<br/>
												<h1>	{info.nbgame} </h1>
												<br/>
												<h4>	GAMES</h4>
								</Col>
								<Col>

												<div>📈</div>
												<br/>
										<h1>{ info?.level?.length ? info?.level[info?.level?.length - 1] : ""}</h1>

												<br/>
												<h4>	LEVEL</h4>
								</Col>
							</Row>

						</Container>
				)
}
