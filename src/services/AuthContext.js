import React, {useContext, useState, useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {auth} from '../services/firebase';
import * as ROUTES from '../constants/routes';


const AuthContext = React.createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [loading,setLoading] = useState(true);
    const [user,setUser] = useState(null);
    const history = useHistory();
    const location = useLocation();


    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
            if(!location.pathname.includes(ROUTES.CALL)){
                if(user){
                    history.push(ROUTES.MAINROOM);
                }else{
                    history.push(ROUTES.SIGNIN);
                }
            }
        })
        return () => unsub();
    },[user,history]);

    const value = { user};

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}