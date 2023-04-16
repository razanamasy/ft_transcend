import {useEffect, useState } from 'react';
import Rimg from 'react-bootstrap/Image';

export const CustomAvatar = ({name} : {name: string}) => {
	const avatar_url = "http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/avatar/" + name + ".png";
	const [loadedSrc, setLoadedSrc] = useState('');
	useEffect(() => {
		setLoadedSrc('');
		if (avatar_url) {
			const handleLoad = () => {
				setLoadedSrc(avatar_url);
			};
			const image = new Image();
			image.addEventListener('load', handleLoad);
			image.src = avatar_url;
			return () => {
				image.removeEventListener('load', handleLoad);
			};
		}
	}, [avatar_url]);
	if (loadedSrc === avatar_url) {
		return (
			<Rimg src={avatar_url} className="img-thumbnail"></Rimg>
		);
	}
	return null;
};
