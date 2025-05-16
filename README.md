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

### Evaluation
#App functionality
Overall my application is fully functional and could be deployed although there are certain things that I would ideally want to change. Firstly the admins cannot edit a runners result time. With the potenial for bad weather conditions admins may make data entry errors which could cause problems as if the wrong time was recorded there is no way of amending such an error. Furthermore the role system has a huge flaw in that its based on user trust, due to no logins anyone that has access to the application can select either an admin or runner role. Although this is out of the scope of the spec, this is something that would have to be addressed to improve security. Additionally a marshall role would have been a good implementation to make to section out the role system further, however since my application does not utilise checkpoints and uses a simple race template of a single start and finish time i decided not to implement this.

#Code
Thoughout my code I have tried to use function names that are readable and explain what happens inside that function, where functions are less obvious i have included brief comments at the top of the function to give future developers an idea of the purpose of the function. However this may not be fool proof as details have been left out due to my personal oversights. This is because I understand my code better then someone who might try to read my code.


## AI
I used AI in helping me to learn certain intricate details about certain parts of my code that were not working properly and I couldn't find  on DevDocs and other sources online. Overall I think AI is a great tool when used to build on knowledge and to help you debug areas of your code that you have issues with. I have detailed below the major prompts I used to help me learn and fix sections of code that were causing me issues. This does not include every single prompt I used, certain prompts I used were for very minor details and I felt like they were unnecessary to list below. 

### Prompt to develop Cache versioning in sw.js
Prompt that helped me develop this feature:

"How do I implement cache versioning in a service-worker.js file to ensure updates are properly applied"
I was initially having a problem where my cache was being taken from an old version not the latest version which meant whenever I loaded up the page I had to do a hard refresh to recently updated features visable. This prompt gave me the basis to cache assets properly in my sw.js file, with this prompt I learnt correct syntax to use, and code layout and structure that i used to fix my version control issue by incrementing the version whenever I made major code changes.

### Prompt to assist me with developing my server side issues in server.js
Prompt that helped me with adding multiple race results to my server

"can you help me implement proper SQLite transactions with express for adding multiple race results"
I was having a problem where my transactional handling on the server side meant that results weren't submitting properly, this prompt helped me to realise I wasn't executing transactions correctly with good error checking. After reviewing some of the examples I was given from this prompt I was able to apply what I learn to my own system with correct syntax and structure.

### Prompt to assist me with developing my syncing issues in offline.js
Prompt that helped me address this issue:

"Can you help me with syncing locally stored race results when internet connection is back online"
I was having an issue where my locally stored race results weren't syncing properly once internet connection was restored. The problem was sending the synced results back to the server. With this prompt I realised it was due to my offlineStorage class not being setup properly meaning that the results weren't being stored in offline storage. This prompt helped me with certain syntax and and code errors I had in this class. I was able to use some of the examples I was given to figure out where I was going wrong and fix my code.

### Prompt to assist me with time formatting
Prompt that helped assist me in this issue:

"How can i use verbose for formatting time"
I discovered verbose is useful for making more user friendly formatting of time, I used this prompt to help me write a function for this. Although this prompt didn't help me very much as although I have used verbose in my code I haven't implemented it correctly to get what I wanted out of it.


