import {useEffect} from 'react';

import {Avatar, ListItemAvatar, ListItemText} from "@mui/material"
import { Fragment, useState} from 'react';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import * as React from 'react';

export const ColorChanIcon = ({status} :  {status : string}) =>
{
	if (status == 'public')
		return (<QuestionAnswerIcon color="primary"/>);
	else if (status == 'private')
		return (<QuestionAnswerIcon color='secondary'/>);
	else if (status == 'protected')
		return (<QuestionAnswerIcon/>);
	else if (status == 'private protected')
		return (<QuestionAnswerIcon color = 'error'/>);
	return (<QuestionAnswerIcon/>)

}

export const GoodChannel = ({name, status} : {name : string, status: number}) =>
{
		const [stat, setstat] = useState<string>("");

		useEffect(() =>
				{
						if (status == 0)
								setstat("public");
						else if (status == 2)
								setstat("protected")
                        else if (status == 1)
                            setstat("private")
                        else if (status == 3)
                            setstat('private protected')
				})
		return(
				<Fragment>
						<ListItemAvatar>
								<Avatar>
								<ColorChanIcon status={stat}/>
								</Avatar>
						</ListItemAvatar>
						<ListItemText primary={name} secondary={stat}/>
				</Fragment>
		)
}
