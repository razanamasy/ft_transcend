import {Box} from "@mui/system"
import {TextField, FormControl, AppBar, Toolbar, Typography} from "@mui/material"
import { Fragment, useState} from 'react';
import ChatIcon from '@mui/icons-material/Chat'
import { useAuth } from './hook/useAuth';
import {withStyles} from '@mui/styles'
import useAxiosPrivate from './hook/useAxiosPrivate';
import Snackbar from '@mui/material/Snackbar';
import {useRef} from "react";
import './styles/XBar.css';
import * as React from 'react';
import { Socket } from 'socket.io-client'

const CssTextField = withStyles({
	root: {
	  '& label.Mui-focused': {
		color: 'blue',
	  },
	  '& .MuiInput-underline:after': {
		borderBottomColor: 'black',
	  },
	  '& .MuiOutlinedInput-root': {
		'& fieldset': {
		  borderColor: 'blue',
		},
		'&:hover fieldset': {
		  borderColor: 'black',
		},
		'&.Mui-focused fieldset': {
		  borderColor: 'blue',
		},
	  },
	},
  })(TextField);

export function Bar ({socket} : {socket : Socket})
{
		const axiosPrivate = useAxiosPrivate();
		const {auth} = useAuth();
		const [namesearch, setnamesearch] = useState<string>("");
		const [open, setopen] = useState<boolean>(false);

		const msg = useRef('default');

		const searchan = async (label : string) =>
		{
			 await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/searchan" ,JSON.stringify({data: {label : label, name : auth.name }})).then( (resp : any) =>
                {
					if (resp.data == 'undefined')
					{
						msg.current = "Channel not found";
						setopen(true);
					}
					else if (resp.data == 'banned')
					{
						msg.current = "You are banned from this server";
						setopen(true);
					}
					else if (resp.data == 'not invited')
					{
						msg.current = "This channel is private"
						setopen(true);
					}
					else if (resp.data != 'added')
					{
						msg.current = "Channel already added";
						setopen(true);
					}
                });

		}

		const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
			if (reason === 'clickaway') {
			  return;
			}
			setopen(false);
		}

		return(
				<Fragment >
						<Box mb={4}>
								<AppBar className="greenBar" position="static">
										<Toolbar sx={{ margin: 2}} >
												<Box mr={2}>
														<ChatIcon fontSize={'large'}/>
												</Box>
												<Typography variant="h6">
														PongChat
												</Typography>
												<Box sx = {{m : 2, width: 1}}>
														<FormControl fullWidth>
																<CssTextField     
																		onChange={(e : any)=>{setnamesearch(e.target.value)}} label="Add Channel" variant='standard' onKeyDown={(e : any) => {if (e.keyCode == 13) searchan(namesearch).then(() => {socket.emit('refreshchan', {room : auth.name + 'Chat'});})}}/>
														</FormControl>
												</Box>
										</Toolbar>
								</AppBar>
								<Snackbar open={open} autoHideDuration={3000}  anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={handleClose} message={msg.current}
      />
						</Box>
				</Fragment>
		)
}
