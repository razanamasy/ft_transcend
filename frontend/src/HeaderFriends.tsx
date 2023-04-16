import { useState, useEffect} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useAuth } from './hook/useAuth';
import {StatFriend} from './StatFriend';
import useAxiosPrivate from './hook/useAxiosPrivate';
import './styles/HeaderFriends.css';
import { CustomAvatar } from './CustomAvatar';

//Bootstrap
import Button from 'react-bootstrap/Button';

export const HeaderFriends = (props: any) => {

	const axiosPrivate = useAxiosPrivate();
	const {auth} = useAuth();

	const [isFriend, setIsFriend] = useState(false);
	const [nickname, setNickname] = useState('');

					useEffect(() => {

						const getOne = async () => {
									try {
												const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/" + props.friendName,
																{
																		params: { name: props.friendName },
																},
												);

												if (ret?.data?.msg == 'not found')
												{
														props.setNotFound(true);
												}
												setNickname(ret.data.nickname)
									}
									catch (e) {
									}
						}

						getOne();

				}, [])

	useEffect (() =>
	{
		let isMounted = true;
		const getIsFriend = async () =>
		{
			try {
				const ret = await axiosPrivate.get
				(
					"http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/isFriend/" + auth.name + "/" + props.friendName,
					{
						params:
						{
							userName: auth.name,
							friendName: props.friendName,
						},
					},
				);
				if (isMounted)
					setIsFriend(ret.data);
			}
			catch (e)
			{
			}
		}
		getIsFriend();
	}, [])	

const followFriend = async (e: any) => {
	e.preventDefault();
	try {
		const	ret = await axiosPrivate.put("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/addFriend" , {info :{userName: auth.name, friendName: props.friendName}})
		setIsFriend(true);
	} catch (e) 
	{
	}
}

const unfollowFriend = async (e: any) => {
	e.preventDefault();
	let isMounted = true;
	try {
		const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/deleteFriend/" + auth.name + "/" + props.friendName, 
				{
params: { name: auth.name },
//				signal: controller.signal,
},
);
//if not Mount, we don't set user
if (isMounted)
	setIsFriend(false);
} catch (e) 
{
}
}

	return (
		<Container>
			<Row>
				<Col xs lg="2">
					<CustomAvatar name={props.friendName} />
				</Col>
				<Col>
					<h2>
					{nickname}
					{
						isFriend ?
						<Button className={'follow-button'} variant="outline-primary" onClick={unfollowFriend}>
							Unfollow friend
						</Button>
						:
						<Button variant="primary" onClick={followFriend} >
							Follow friends
						</Button>
					}
					<br/>
					<StatFriend friendName={props.friendName}/>
					{/* send the props from HeaderFriends*/}
					</h2>
				</Col>
			</Row>
		</Container>
	)
}
