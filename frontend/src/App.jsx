import { Outlet } from "react-router-dom";
import { ToastContainer  } from "react-toastify";
import { UserProvider } from "./context/useAuth";
import "react-toastify/dist/ReactToastify.css";

function App(){
    return(
        <>
            <UserProvider>
                <Outlet/>
                <ToastContainer 
                    position="top-right" 
                    autoClose={5000} 
                    hideProgressBar={false} 
                    newestOnTop={false} 
                    closeOnClick 
                    rtl={false} 
                    pauseOnFocusLoss 
                    draggable 
                    pauseOnHover 
                />
            </UserProvider>
        </>
    );
}

export default App;