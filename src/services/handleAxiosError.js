import { showTimedAlert, RefetchPolygons } from '../Utils/dispatchUtility';

const handleAxiosError = (error) => {
    if (error.response) {
      //console.log(error.response)
        if (error.message===undefined){
            showTimedAlert({ text: "An unspecified error occured", variant: 'danger' });
        } else {
          //console.log(error)
            showTimedAlert({ text: error.response.data.message, variant: 'danger' });
        }
    } else if (error.request) {
      console.log('no connection');
      showTimedAlert({ text: 'Failed to connect to the server', variant: 'danger' });
      setTimeout(() => RefetchPolygons(), 5000);
    } else {
      showTimedAlert({ text: 'something unexpected happened', variant: 'danger' });
      //throw new Error(error.message);
      console.log("error:", error)

    };
}

export default handleAxiosError;