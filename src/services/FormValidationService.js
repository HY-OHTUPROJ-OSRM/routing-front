export const validateName = (name) => {
    const regex = /^[a-zA-Z0-9-äö ]{3,30}$/;
    //console.log('namedval', regex.test(name));
    return regex.test(name);
  };
  
  
  export const validateCoordinate = (coordinate) => {
    const coordinateRegex = /^(\d+(\.\d+)?|\.\d+)$/;
    const value = parseFloat(coordinate);
    //console.log('cordval', coordinateRegex.test(coordinate) && !isNaN(value) && value > 0 && value < 90 && value!=="");
    return coordinateRegex.test(coordinate) && !isNaN(value) && value > 0 && value < 90 && value!=="";
  };
  
  export const validateSeverity = (severity) => {
    //const regex = /^[+-](?!0\b)\d+(km\/h|%)$/;
    const regex = /^(?!0\b)\d+$/;
    return regex.test(severity);
  };

  export const validateEffectValue = (effectValue, type) => {
    if (['offset', 'cap', 'constant'].includes(type)) {
      // Validate as an integer
      const integerRegex = /^-?\d+$/;
      return integerRegex.test(effectValue);
    } else if (type === 'factor') {
      // Validate as an integer or float
      const floatRegex = /^\d+(\.\d+)?$/;
      return floatRegex.test(effectValue);
    }
    return true;
  };
  
  // Validator for type
  export const validateType = (type) => {
    return ['roadblock', 'cap', 'constant', 'offset', 'factor'].includes(type);
  };