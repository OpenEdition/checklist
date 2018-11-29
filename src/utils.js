// Eval a condition defined as a string
function evalStringCondition (condition, context) {
  // Replace context keys by their values in string (false if undefined)
  function replaceAttributes (condition, context) {
    const regex = /\b[^!&|()]*\b/g;
    return condition.replace(regex, (key) => {
      if (key.trim().length === 0) return key;
      return typeof context[key] !== "undefined" ? context[key] : false;
    });
  }

  const conditionToEval = replaceAttributes(condition, context);
  // No worry, eval is safe here
  // jshint evil: true
  return eval(conditionToEval);
}

const utils = {
  testCondition: function (condition, context) {
    if (typeof condition === "function") {
      return condition(context);
    } else if (typeof condition === "string") {
      return evalStringCondition(condition, context);
    }
    return true;
  }
};

module.exports = utils;
