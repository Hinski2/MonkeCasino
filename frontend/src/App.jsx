import { Outlet } from "react-router-dom";
import { ToastContainer  } from "react-toastify";
import { UserProvider } from "./context/useAuth";

function App(){
    return(
        <>
            <UserProvider>
                <Outlet/>
                <ToastContainer />
            </UserProvider>
        </>
    );
}

export default App;