# Lodge-CLI

Hey guys, 

I'm sorry I haven't been able to work more on this -- I've been trying to get wifi but it's been difficult. 

If you have enough work to keep you occupiued, It's in a half-built state and it might be most efficient we just wait for me to get back to work on it. 
Once you are done with your part, I really doubt this will take more than 2 days to finish. 
I think it could be a good idea to wait for it too, since I'll really need the final version of what you have to finish the tool.


If you would rather go at it while I'm gone though, the gist of what it needs to not error on runtime is:
- I need to figure out how to get JSON response from shelljs .exec() to get back lists of vpc-ids and subnet-ids to get a list for the user to choose from (this eliminates having them input and check for errors at the end)
- the questions list for the install right now still needs the info from the above bullet point to iterate through.
- The aws calls are being put in the lib/aws.js file
- I need to look at using inquirer to input the aws calls to generate the list for a user. 
- The commands in the aws file
- every time you call the file the clone and install function will download a copy of a random repo I have. That's what the frontend-todo-app is. 

The gist of how it works is:
- run lodge --install in the command line to use the tool
- you may need to run npm link first
- shelljs lets you run terminal commands and get the output. This means you can run an aws to show you a list of your (the user's) subnets that match a given filter, for example, and we can get that data back and format it and use it accordingly.
- inquirer is an interface for generating questions / handling responses of the user through the cli. 

