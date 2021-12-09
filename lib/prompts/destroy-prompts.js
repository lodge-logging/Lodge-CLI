const inquirer = require("inquirer");

const prompts = {
  async destroy() {
    console.clear();
    await this._confirmDestroy();
    this._destroyPrompt();
    return true;
  },

  async _confirmDestroy() {
    const answer = await inquirer.prompt([{
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to destroy your Lodge stack?`,
    }]);

    if (!answer.confirm) process.exit();
  },

  _destroyPrompt() {
    console.log('Destroying stack...');
  },
}

module.exports = prompts;