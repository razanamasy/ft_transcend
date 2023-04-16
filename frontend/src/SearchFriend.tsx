import { useLocation} from "react-router-dom";
import useAxiosPrivate from './hook/useAxiosPrivate';
import { useState} from 'react';
import './styles/SearchFriend.css';

//Bootstrap
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import {

useNavigate,
} from "react-router-dom";

export const SearchFriend = () => {

	const location = useLocation();
	const navigate = useNavigate();
	const axiosPrivate = useAxiosPrivate();
	const [friendName, setFriendName] = useState(''); 

	const navFriendDashboard = async (e: any) => {
				e.preventDefault();
			const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/findUserByNickName/" + friendName, 
				{
						params: { name: friendName },
				},
			);
			if (ret?.data?.nickname != undefined)
			{
				if (location.pathname.substring(0,17) === "/Dashboard/Friend")
				{
					navigate("Dashboard/Friend/" + ret.data.name, {replace: true})
					window.location.reload();
				}
				else
					navigate("Dashboard/Friend/" + ret.data.name)
			}
			else
				window.alert("User not found");
	}

	return (
	<div className="searchFriend" >
				<Form onSubmit={navFriendDashboard} >
					<Row>
    	  		<Col  className="colSearch" sm={9}>
					  <Form.Control
						placeholder="Search friends"
						type="text"
						id="input"
					onChange={(e) => setFriendName(e.target.value) }
					  />
      		</Col>
    	  		<Col className="colSearch" sm={1}>
					<Button variant="primary" type="submit" >GO</Button>
      		</Col>
					</Row>
				</Form>
	</div>
	);
}
