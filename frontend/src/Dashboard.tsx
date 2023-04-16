import { useState, useEffect} from 'react';
import {MatchHistory} from './MatchHistory';
import {Achievements} from './Achievements';
import {FriendList} from './friendList';
import {Header} from './Header';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { Line } from "react-chartjs-2";
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate';
import {CategoryScale} from 'chart.js';
import Chart from 'chart.js/auto';
import './styles/Dashboard.css'

//Bootstrap
import Nav from 'react-bootstrap/Nav';

export const Graph = () => {
	const [info, setinfo] = useState<{level : number[], nbgame:number, nbwin:number}>({level:[], nbgame:0, nbwin:0});
	const { auth } = useAuth();
	const axiosPrivate = useAxiosPrivate();

	Chart.register(CategoryScale);

	const loadinfo = async () =>
	{
		const ret = await axiosPrivate.post('http://' + process.env.REACT_APP_HOSTNAME42 + ':3000/api/pong/getStats/',
		JSON.stringify({name : auth.name}),
		{
			withCredentials : true, 
			headers:
			{
				'Content-Type' : 'application/json'
			}
		});
		if (ret?.data?.msg != "no stats")
			setinfo(ret.data);
	}

	useEffect(() => {
		loadinfo();
	}, [])

	const data = {
		labels: Array.from(Array(info.nbgame + 1).keys()),
		datasets: [
		  {
			label: "Evolution",
			data: info.level,
		  }
		]
	  };

	  if (info.nbgame >= 3)
	  {
		return (
			<div>
			<Line data={data} />
			</div>
		)
	  }


	return (<h2>Play at least 3 games admirer your epic graph</h2>)

}

export const Dashboard = () => {

		const { auth } = useAuth();
		const axiosPrivate = useAxiosPrivate();

		const [modeMatch, setModeMatch] = useState(true);


		const focusMatch = () => {
				setModeMatch(true);
		}

		const focusFriend = () => {
				setModeMatch(false);
		}

			return (
			<div className="smallContainer">
				<Header/>

						<Tabs
							defaultActiveKey="matchHistory"
							transition={false}
							id="noanim-tab-example"
						>
							<Tab className="test" eventKey="matchHistory" title="Match History">
									<MatchHistory/>
							</Tab>
							<Tab eventKey="friends" className="test" title="Friends">
									<FriendList />
							</Tab>
							<Tab eventKey="achievements" className="test" title="Achievements">
									<Achievements />
							</Tab>
							<Tab eventKey="graph" className="test" title="Graph">
								<Graph/>
							</Tab>
						</Tabs>
			</div>
);
}
