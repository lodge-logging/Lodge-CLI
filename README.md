# Lodge-CLI

The main functionality of the CLI is done. What's left is to figure out where the code for the stack is when it runs. Also, we need to decide if we are going to publish this, the stack, or both as npm packages.

The gist of how it works is:
- run lodge --install in the command line to use the tool
- you may need to run npm link first
- shelljs lets you run terminal commands and get the output. This means you can run an aws to show you a list of your (the user's) subnets that match a given filter, for example, and we can get that data back and format it and use it accordingly.
- inquirer is an interface for generating questions / handling responses of the user through the cli. 

