import {useEffect} from 'react';
import { Avatar, ListItemAvatar, ListItemText } from "@mui/material"
import { Fragment, useState} from 'react';
import useAxiosPrivate from './hook/useAxiosPrivate';
import { Socket } from 'socket.io-client'
import Badge from '@mui/material/Badge';

import { useSocket } from './hook/useSocket';

import * as React from 'react';

export const ColorBadge = ({name, realname, status}: {name: string, realname: string, status : string}) => {
	const avatar_url = "http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/avatar/" + realname + ".png";

	if (status == 'online')
	{
		return (
		<Badge overlap="circular" color='primary' badgeContent=" " variant="dot">
		<Avatar
			src={avatar_url}>
		</Avatar>
		</Badge>
		)
	}
	else if (status == 'offline')
	{
		return (
		<Badge overlap="circular" badgeContent=" " variant="dot">
		<Avatar
			src={avatar_url}>
		</Avatar>
		</Badge>
		)
	}
	else if (status == 'playing')
	{
		return ( 
		<Badge overlap="circular" color='secondary' badgeContent=" " variant="dot">
		<Avatar
			src={avatar_url}>
		</Avatar>
		</Badge>
		)
	}

return (

	<Badge overlap="circular"  badgeContent=" " variant="dot">
		<Avatar
			src={avatar_url}>
		</Avatar>
	</Badge>
)
}

export const Friends = ({socket, name} : {socket: Socket, name : string}) =>
{
		const {socketConnexion} = useSocket();
		const {socketPong} = useSocket();
		const [stat, setstat] = useState<string>("");
		const axiosPrivate = useAxiosPrivate();
		const [nicknameFriend, setNicknameFriend] = useState("");

		const loadStatus = async () => {
			try {

				await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/getstatus" , JSON.stringify({info: {name : name}})).then( (ret :any) => {
				if (ret.data.status == 1)
					setstat('online')
				else if (ret.data.status == 0)
					setstat('offline')
				else if (ret.data.status == 2)
					setstat('playing')
					;})
			} catch (e) 
			{
			}
		}
		useEffect(() => {
				const getNickNameFriend = async () => {
										const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/" + name, 
												{
														params: { name: name },
												},
										);
										setNicknameFriend(ret.data.nickname);
				}
				getNickNameFriend();
		}, []);

		useEffect(() =>
				{
					loadStatus();
							socketPong.on('changestatus', (data : any) => {
								loadStatus();
						})
				}, [])

		useEffect(() =>
				{
					loadStatus();
							socketConnexion.on('changestatus', (data : any) => {
							if ( data.name == name)
							{
								loadStatus();
							}

						})
				}, [])

		return(
				<Fragment>
						<ListItemAvatar>
						<ColorBadge name={nicknameFriend} realname={name} status={stat}/>


						</ListItemAvatar>
						<ListItemText style={{color: 'white'}} primary={nicknameFriend} secondary={stat}/>
				</Fragment>
		)
}


export const MemoizedFriends = React.memo(Friends);
