evaluation
--cant edit results 

# Race Time - by up2245678
## Key features
The key features of my application include:
Creating races.
Starting and ending a race.
Recording finish times.
Uploading results to the server.
Viewing available races.
Viewing race results.
Deleting a race.
Exporting race results to a csv file.
Admin and Runner roles.


### Creating a race.
In my main application app.js on line 153 you will find my CreateRace() method which first checks if the user has the admin role, if so it takes two inputs, race name and race date
which are required fields to create a race. This method has basic error checking to make sure the user has inputted values into both fields along with checking that the user is online
before making an API call to the server. If this criteria is met the race data is sent to the server via fetch().
This is a core feature of my application as it is necessary that users can create multiple races, the error handling i included is important as a failed API request could crash my application. 


### Starting and ending a race.
In my main application app.js on line 350 and 475 you will find my startRace() and endRace() functions. The user cannot start a race when offline as this would be overly complex so there is a check in place. However a user can end a race when offline, the timer is stopped only locally and the PUT request to the server is done once the user is back online. In both methods I use if() statements to disable and enable buttons for better usability and to prevent unwanted errors.
This is another core feature of my application as it is necessary for users to be able to start and end races on a timer app!


### Recording finish times.
In my main application app.js on line 400 you will find my recordFinish() method which is formatted in the same way as all my other methods by first doing checks such as, checking if the timer is running along with making sure the user does not enter the same bib number twice and rejecting invalid entries. If the checks are passed the result is stored locally in the local results array. I made sure to store the results in the offline storage so that if the user goes offline the data isn't lost.


### Uploading results to the server.
In my main application app.js on line 508 you will find my uploadResults() method which again does checks first to see if the user is online before using POST to upload the results to the server, along with making sure there are results stored locally to upload. After uploading results successfully the 












## AI
Replace this with DETAIL about your use of AI, listing of the prompts you used, and whether the results formed or inspired part of your final submission and where we can see this (and if not, why not?). You may wish to group prompts into headings/sections - use markdown in any way that it helps you communicate your use of AI.  Tell us about what went right,  what went horribly wrong and what you learned from it.

### Prompts to develop XYZ (example)
A sequence of prompts helped me develop this feature:

>  this is an example prompt given to a chatbot
The response was proved useless because the prompt wasn't specific enough about XYZ, so:

>  this is an example prompt given to a chatbot detailing XYZ
The response was better so I could specifically ask about QRST - this may evolve into a longer discussion highlighting some insight you gained… who knows where you might pick up marks!

>  how can I integrate QRST here?
The suggestion worked with minor modifications.

### Prompts to develop GHIJ (example)
For the GHIJ feature I ...

>  this is an example prompt given to a chatbot
words words words et
