import { showTimedAlert, RefetchPolygons } from '../Utils/dispatchUtility';
//A general service for displaying error messages when someting goes wrong with axios requests
//If backend responds with a message it is displayed, otherwise a generic message is displayed
const handleAxiosError = (error) => {
    if (error.response) {
        if (error.message===undefined){
            showTimedAlert({ text: "An unspecified error occured", variant: 'danger' });
        } else {
            showTimedAlert({ text: error.response.data.message, variant: 'danger' });
        }
    } else if (error.request) {
      console.log('no connection');
      showTimedAlert({ text: 'Failed to connect to the server', variant: 'danger' });
      setTimeout(() => RefetchPolygons(), 5000);
    } else {
      showTimedAlert({ text: 'something unexpected happened', variant: 'danger' });
      console.log("error:", error)
    };
}

export default handleAxiosError;