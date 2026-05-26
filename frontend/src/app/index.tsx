import { createContext } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouteIndex from "../routes";


const GlobalContext = createContext<globalContextValue | null>(null);

interface globalContextValue{

}

interface Props{
    children:React.ReactNode
}

export default function Index(){
    return(
        <GlobalContext.Provider value={{}}> 
        <Router>
            <ProtectedRoutes>
                <RouteIndex/>
            </ProtectedRoutes>            
        </Router>
        </GlobalContext.Provider>
    )
}

function ProtectedRoutes({children}:Props){
    return(
        <div>{children}</div>     
    )
}