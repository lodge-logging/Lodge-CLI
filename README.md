# Lodge-CLI

The main functionality of the CLI is done. What's left is to publish it as an npm package that can be installed globally. Once that is done, the user will download it , then run `lodge init`, which will clone the main repo into a subdirectory, install the dependencies, and deploy the cdk app with the necessary information provided by the user and retrieved by the aws cli. 

We also need to communicate to the user that we are assuming they have the aws cli with ssm manager and the cdk cli installed and configured. We will most likely need to provide some instructions for these.

Some ASCII art would be nice, too, once we settle on a logo.

The gist of how it works is:
- run `lodge init` in the command line to use the tool
- you may need to run `npm link` first

