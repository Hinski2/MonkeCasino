import axios from "axios"
import { toast } from "react-toastify";

export const handleError = (error) => {
    if(error?.user_message){
        toast.warning(error.user_message)
    } else if(error?.message){
        toast.warning(error.message)
    } else {
        toast.error(error);
        console.log(error)
    }
}