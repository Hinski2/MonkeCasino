import axios from "axios"
import { toast } from "react-toastify";

export const handleError = (error) => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const backendMessage = error.response.data?.user_message || error.response.data?.message || error.response.data?.error;
            toast.error(backendMessage); 
        } else if (error.request) {
            toast.error("No response from server. Please check your internet connection.");
        } else {
            toast.error(`Request Error: ${error.message}`);
        }
    } else {
        if(error?.user_message){
            toast.warning(error.user_message)
        } else if(error?.message){
            toast.warning(error.message)
        } else {
            toast.error(error);
        }
    }

    console.log(error);
}