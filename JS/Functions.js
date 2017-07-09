var prevSearch = "";
var foundArray = new Array();
var currentPage = 1;
var currentQuery = "";
var htmlTable;
var errorMessage;

//Initial call to create the correct information to get information from MovieDB
function StartSearch(inputKeyword, table, errorDoc) {
	//If there the last searched keyword is being searched again there is no need to update
	if(prevSearch == inputKeyword){
		return;
	}
	
	//Reset global values for the last searched keyword, current page being queried, and the parsed array of data 
	prevSearch = inputKeyword;
	currentPage = 1;
	foundArray = new Array();
	htmlTable = table;
	errorMessage = errorDoc;
	
	//Check if there as spaces in the keyword and search replace spaces with '+' for the query
	inputKeyword = inputKeyword.replace(/\s+/g, '+');
	
	//Setup the initial string to access data from the moviedb
	var initialSearchString = "https://api.themoviedb.org/3/search/movie?api_key=90e1236a629aebd9378f4b839ec0320e&query=";	
	
	//Add the keyword and current page to the string
	currentQuery = initialSearchString + inputKeyword + "&page=";
	
	//Call the function to query the moviedb database
	loadDoc(currentQuery + currentPage);
}

//Use Ajax to get information from the MovieDB
function loadDoc( inString ) {
  var xhttp;
  if (window.XMLHttpRequest) {
    // code for modern browsers
    xhttp = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      ParseAndSave(this.responseText);
    }
  };
  xhttp.open("GET", inString, true);
  xhttp.send();
}

//Parse through information from MovieDB and save the information to update the table
function ParseAndSave( inString ) {
	//Use JSON to parse the input
	var parsedInput = JSON.parse(inString);
	
	//Check for the total number of results found
	var totalResults = parsedInput.total_results;
	
	//If there are no results found then a message should be returned
	if(totalResults <= 0)
	{
		ClearTable();
		errorMessage.innerHTML = "No Results Found. Try Again!";
		return;
	}
	else
	{
		errorMessage.innerHTML = "";
		//Find the total number of pages of results
		var numPages = parsedInput.total_pages;
		
		//There are 20 per page, so created variable that is only altered on final page
		var resultsToCheck = 20;	
		//Check if it is the final page
		if(currentPage == numPages)
		{
			//If it is the finalpage then you do not want to parse through the whole 20 if the total results is not evenly divisble by 20
			resultsToCheck = totalResults - ((numPages - 1) * 20);
		}
			
		for(pageResults = 0; pageResults < resultsToCheck; pageResults++)
		{
			//Parse each result into a new object and save it into the foundArray
			var foundEntry = new Object();
			foundEntry.numVotes = parsedInput.results[pageResults].vote_count;
			foundEntry.id = parsedInput.results[pageResults].id;
			foundEntry.hasVideo = parsedInput.results[pageResults].video;
			foundEntry.voteAvg = parsedInput.results[pageResults].vote_average;
			foundEntry.title = parsedInput.results[pageResults].title;
			foundEntry.popularity = parsedInput.results[pageResults].popularity;
			foundEntry.pathToPoster = parsedInput.results[pageResults].poster_path;
			foundEntry.language = parsedInput.results[pageResults].original_language;
			foundEntry.origTitle = parsedInput.results[pageResults].original_title;
			var saveGenres = new Array();
			for(var x = 0; x < parsedInput.results[pageResults].genre_ids.length; x++)
			{
				saveGenres[x] = parsedInput.results[pageResults].genre_ids[x];
			}
			
			foundEntry.genreIDs = saveGenres;
			
			foundEntry.pathToBackdrop = parsedInput.results[pageResults].backdrop_path;
			foundEntry.isAdult = parsedInput.results[pageResults].adult;
			foundEntry.overview = parsedInput.results[pageResults].overview;
			foundEntry.releaseDate = parsedInput.results[pageResults].release_date;
			
			
			//Want to add the objects to the correct indexes based on the pages
			foundArray[((currentPage - 1) * 20) + pageResults] = foundEntry;
		}
		
		//If there are more pages then query next page
		if(currentPage != numPages)
		{
			currentPage++;		
			loadDoc(currentQuery + currentPage);
		}
		//Otherwise all information is gathered and the final table can be made
		else
		{
			UpdateTable(1);
		}
		

	}
	
}

//Update the table based on the information received from MovieDB
function UpdateTable( tablePage ){
	//Clear out the current table rows for edit
	ClearTable();
	htmlTable.appendChild(document.createElement('tbody'));
	var tableBody = htmlTable.tBodies[0];
	//Loop through all entries found and parsed
	for(var integer = 0; integer < foundArray.length; integer++)
	{
		
		// Create an empty <tr> element and add it to the 1st position of the table:
		var row = tableBody.insertRow(integer);

		// Create cells for the new table
		var in1 = row.insertCell(0);	
		var in2 = row.insertCell(1);
		var in3 = row.insertCell(2);
		var in4 = row.insertCell(3);
		var in5 = row.insertCell(4);
		var in6 = row.insertCell(5);
		var in7 = row.insertCell(6);
		
		//Set the width of the cells to match the header
		in1.style.width = "10%";
		in2.style.width = "5%";
		in3.style.width = "5%";
		in4.style.width = "5%";
		in5.style.width = "10%";
		in6.style.width = "55%";
		in7.style.width = "10%";
		
		//Fill the newly created cells with the information from MovieDB
		in1.innerHTML = foundArray[integer].title;
		in2.innerHTML = foundArray[integer].voteAvg;
		in3.innerHTML = foundArray[integer].popularity;
		in4.innerHTML = foundArray[integer].language;
		in5.innerHTML = foundArray[integer].origTitle;
		in6.innerHTML = foundArray[integer].overview;
		in7.innerHTML = foundArray[integer].releaseDate;           
	}
}

//Clear out the table so it can be updated with new information
function ClearTable(){
	//Clear out the table for new information, leave the header
	for(var i = htmlTable.rows.length - 1; i >= 1; i--)
	{
		htmlTable.deleteRow(i);
	}
	
	//Removed the body because it is created in the update function anytime a search is successful
	var body = htmlTable.getElementsByTagName("tbody");
	if(body.length > 0)
		htmlTable.removeChild(body[0]);
}

//Created a funtion to check if Enter was pressed to start the search
function KeyPressed(e, inputKeyword, table, errorDoc){
	var keyPressed = e.which || e.keyCode;
	if(keyPressed == 13)
		StartSearch(inputKeyword, table, errorDoc);
}

