import { createContext, useState, ReactNode  } from "react";

export const AuthContext = createContext({
				modeInvitation : "",
				setModeInvitation: (modeInvitation: "") => {},
				myInviter: "",
				setMyInviter: (myInviter: "") => {},
				myInvited: "",
				setMyInvited: (myInvited: "") => {},
				isInviter: false,
				setIsInviter: (isInviter: boolean) => {},
				isInvited: false,
				setIsInvited: (isInvited: boolean) => {},
				inInviteProcess: false,
				setInInviteProcess: (inInviteProcess: boolean) => {},
				auth: {name:'', nickname:'', enable2FA: false, passLog: false},
				setAuth: (auth: {name:string, enable2FA:boolean, passLog:boolean, nickname:string}) => {}
});

interface Props {
    children?: ReactNode
    // any props that come into the component
}

export const AuthProvider = ({ children }: Props) => {
				const [auth, setAuth] = useState({name:'', nickname:'', enable2FA: false, passLog: false});
				const [isInviter, setIsInviter] = useState(false);
				const [isInvited, setIsInvited] = useState(false);
				const [inInviteProcess, setInInviteProcess] = useState(false);
				const [myInvited, setMyInvited] = useState("");
				const [myInviter, setMyInviter] = useState("");
				const [modeInvitation, setModeInvitation] = useState("");

			return (
					<AuthContext.Provider value={{modeInvitation, setModeInvitation, myInviter,setMyInviter, myInvited, setMyInvited,  isInviter, setIsInviter, isInvited, setIsInvited, inInviteProcess,setInInviteProcess, auth, setAuth}}>
									{children}
					</AuthContext.Provider>
			)
}

export default AuthContext;
