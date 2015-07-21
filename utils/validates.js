module.exports = {

  /**
   * validates the userInput to see if a appName was entered
   * @param  {string} userInput input of user
   * @return {boolean|string}   true if ok, string if failed
   */
  validateSection: function (userInput) {
    return userInput ? true : 'Introduce mínimo una sección.';
  }
};