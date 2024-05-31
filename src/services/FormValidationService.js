export const validateName = (name) => {
    const regex = /^[a-zA-Z0-9 ]{3,30}$/;
    //console.log('namedval', regex.test(name));
    return regex.test(name);
  };
  
  export const validateType = (type) => {
    return type === 'roadblock' || type === 'traffic';
  };
  
  export const validateCoordinate = (coordinate) => {
    const coordinateRegex = /^(\d+(\.\d+)?|\.\d+)$/;
    const value = parseFloat(coordinate);
    //console.log('cordval', coordinateRegex.test(coordinate) && !isNaN(value) && value > 0 && value < 90 && value!=="");
    return coordinateRegex.test(coordinate) && !isNaN(value) && value > 0 && value < 90 && value!=="";
  };
  
  export const validateSeverity = (severity) => {
    return ['mild', 'average', 'severe'].includes(severity);
  };