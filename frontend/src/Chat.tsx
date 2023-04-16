import React, { useState, useEffect } from 'react';
import './App.css';
import useAxiosPrivate from './hook/useAxiosPrivate'
import { XChat } from './XChat';



export const Chat = () => {

			const axiosPrivate = useAxiosPrivate();
			const [users, setUsers] = useState([{name: "", enable2FA: false}]);

			return (
			<div>
					<XChat/>
			</div>);
}
