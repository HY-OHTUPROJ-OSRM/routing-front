//validate name
export const validateName = (name) => {
    const regex = /^[a-zA-Z0-9-äö ]{3,30}$/;
    return regex.test(name);
  };
  
  //validate coordinate
  export const validateCoordinate = (coordinate) => {
    const coordinateRegex = /^(\d+(\.\d+)?|\.\d+)$/;
    const value = parseFloat(coordinate);
    return coordinateRegex.test(coordinate) && !isNaN(value) && value > 0 && value < 90 && value!=="";
  };
  //not used?
  export const validateSeverity = (severity) => {
    const regex = /^(?!0\b)\d+$/;
    return regex.test(severity);
  };
  //validate effect value
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