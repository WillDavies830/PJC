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
In my main application app.js on line 350 and 475 you will find my startRace() and endRace() methods. The user cannot start a race when offline as this would be overly complex so there is a check in place. However a user can end a race when offline, the timer is stopped only locally and the PUT request to the server is done once the user is back online. In both methods I use if() statements to disable and enable buttons for better usability and to prevent unwanted errors.
This is another core feature of my application as it is necessary for users to be able to start and end races on a timer app!


### Recording finish times.
In my main application app.js on line 400 you will find my recordFinish() method which is formatted in the same way as all my other methods by first doing checks such as, checking if the timer is running along with making sure the user does not enter the same bib number twice and rejecting invalid entries. If the checks are passed the result is stored locally in the local results array. I made sure to store the results in the offline storage so that if the user goes offline the data isn't lost.


### Uploading results to the server.
In my main application app.js on line 508 you will find my uploadResults() method which again does checks first to see if the user is online before using POST to upload the results to the server, along with making sure there are results stored locally to upload. After uploading results successfully this method disables the upload and clear results buttons to not confuse the user.


### Viewing available races.
In my main application app.js on line 220 you will find my viewRaces() method which uses fetch() to retrieve available races from the server. I also use a check to see if the user is online before making the API call to the server. If the user is offline, it displays only races that are stored in local storage.


### Viewing race results.
In my main application app.js on line 604 you will find my loadRaceResults() method which fetches data from the server to display results for a specific race. This method makes two API calls, one to fetch the race details and another to fetch the race results. After retrieving the data, it displays the results in a table format with position, bib number and finish time. The method also includes error handling for offline scenarios and server errors.


### Deleting a race.
In my main application app.js on line 262 you will find my deleteRace() method which first checks if the user has the admin role, if so it asks for confirmation before making a DELETE request to the server. This method includes error checking to make sure the user is online before attempting to delete a race, and it also provides feedback to the user with a notification once the race is successfully deleted.


### Exporting race results to a csv file.
In my main application app.js on line 559 you will find my exportRaceResults() method which first downloads race and result data from the server, then formats this data into a CSV string. It creates a downloadable link element with the CSV data and automatically triggers the download for the user. The CSV includes position, bib number, and race time for each runner, sorted by finish time.
This feature is not needed for complete functionality but is a quality of life feature. Having the ability to download the results of a race after it is finished means the runners can store the results permenantly on their device for future reference,


### Admin and Runner roles.
Throughout my application you will find role-based access control implemented in methods like initRoleBasedAccess() on line 98, isAdmin() on line 145, and showScreen() on line 150. The application allows users to switch between admin and runner roles, with the chosen role stored in localStorage. Admin users have full functionality of the application whereas the runner role can only see view races along with just the view results and export buttons on this page. I use CSS to indicate to the user which role is active.
I thought this was a key feature in my application as race runners should only have basic access, they do not need to be able to create and delete races along with any control over the race timer.




## AI


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
