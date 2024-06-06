import { showTimedAlert, RefetchPolygons } from '../Utils/dispatchUtility';

const handleAxiosError = (error) => {
    if (error.response) {
      console.log(error.response)
        if (error.message===undefined){
            showTimedAlert({ text: "An unspecified error occured", variant: 'failure' });
        } else {
            showTimedAlert({ text: error.message, variant: 'failure' });
        }
    } else if (error.request) {
      console.log('no connection');
      showTimedAlert({ text: 'Failed to connect to the server', variant: 'failure' });
      setTimeout(() => RefetchPolygons(), 5000);
    } else {
      showTimedAlert({ text: 'something unexpected happened', variant: 'failure' });
      //throw new Error(error.message);
      console.log("error:", error)

    };
}

export default handleAxiosError;