import { showTimedAlert } from '../Utils/dispatchUtility';

const handleAxiosError = (error) => {
    if (error.response) {
        if (error.response.data.message===undefined){
            showTimedAlert({ text: "An undefined error occured on server", variant: 'failure' });
        } else {
            showTimedAlert({ text: error.response.data.message, variant: 'failure' });
        }
    } else if (error.request) {
      console.log('no connection');
      showTimedAlert({ text: 'Failed to connect to the server', variant: 'failure' });
    } else {
      showTimedAlert({ text: 'something unexpected happened', variant: 'failure' });
      //throw new Error(error.message);
      console.log("error:", error)
    };
}

export default handleAxiosError;