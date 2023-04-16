import {Box} from "@mui/system"
import {Container, Typography} from "@mui/material"
import './Chat.css'
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';

import * as React from 'react';

export function ListInvited({listusers, setinvitelist, invitelist} : {listusers : {name : string, status : number, nickname : string}[], setinvitelist : any, invitelist : string[]})
{

		const updateinvitelist = (u : string) =>
		{
				if (invitelist.find( e => e == u) != undefined)
				{
						setinvitelist(invitelist.filter(e => e != u));
				}
				else
				{
						setinvitelist([...invitelist, u])
				}
		}
		const displistusers = listusers.map((u, index) => 
				<div key={index}> 
						<FormGroup>
								<FormControlLabel control={<Checkbox onChange={() => updateinvitelist(u.name)}/>} label={u.nickname} />
						</FormGroup>
				</div>
		);

		return(
				<div>
						<Container>
								<Box className='listinvite' m = {2}>
										<Typography  variant='subtitle1' gutterBottom>
												Invite :
										</Typography>
										{displistusers}
								</Box>
						</Container>

				</div>
		);
}
