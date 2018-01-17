videojs.registerPlugin('playbackPaging', function() {
    var myPlayer = this,
				requestData,
				mediaData,
				apiRequest,
				apiBaseURL = 'https://edge.api.brightcove.com/playback/v1/accounts/',
				policyKey = "BCpkADawqM3_9ax216PJYuUTLApMLkLJ3apjFlTRKHHS4q0DE33J0XsiDWmc6SfKwrwRAhejCZpTbwljz4-OlUwyqKi64L25Dwy4yhY1eSZ9ZduI-dO0mjSNVcR9C8nz0jtkimOOtzQgswCr",
				accountId = "1752604059001",
				playlistId = "5282200243001",
				videoData = [],
				mediaType,
				offsetValue = 0,
				limitValue = 3,
				firstTime = true,
				eNextButton = document.getElementById("nextButton"),
				// Optional: get a reference to the API request display element
				eApiRequest = document.getElementById("apiRequest"),
				playlistLength;

		videojs("myPlayerID").ready(function(){
			// Get a reference to the player
			myPlayer = this;
			// Use the catalog library to get the playlist object
			myPlayer.catalog.getPlaylist(playlistId, function(error, playlist){
				// Save the playlist length
				playlistLength = playlist.length;
				// Display the videos in the current playlist
				displayPlaylist();
				// Add a listener to the Next Videos button
				eNextButton.addEventListener("click",function(){
					// Advance the video offset value by 3 to get the next videos in the playlist
					offsetValue += 3;
					// If the offset value is greater than the playlist length, then go back to the beginning of the playlist
					if (offsetValue >= playlistLength) {
						offsetValue = 0;
					}
					// Display the videos in the current playlist
					displayPlaylist();
				});
			})
		});

		function displayPlaylist() {
			// Set up data for Playback API request
			requestData = setRequestData();
			mediaType = 'playlist';
			// Make the Playback API request to get playlist data
			getMediaData(mediaType, requestData, function (mediaData) {
				// Loop through video data and change duration from milliseconds to seconds
				for (var i=0; i<limitValue; i++) {
					mediaData.videos[i] = myPlayer.catalog.transformVideoResponse(mediaData.videos[i], myPlayer);
				}
				console.log("mediaData= ",mediaData);
				// Load the first video of the current playlist to the player
				myPlayer.catalog.load(mediaData.videos[0]);
				// Add the newest videos list to the playlist
				myPlayer.playlist(mediaData.videos);
				console.log("playlist= ",myPlayer.playlist);
			});
		}

		/**
		 * Set up the data for the API request
		 */
		 function setRequestData() {
			 var requestURL = '';
			 // Create the request URL with offset and limit parameters
			 requestURL = apiBaseURL +  accountId + '/playlists/' + playlistId + '?offset=' + offsetValue + '&limit=' + limitValue;
			 // Optional: display the request URL
			 eApiRequest.innerHTML = requestURL;
			 return requestURL;
			}

		 /**
			* Request data from the Playback API
			*/
			getMediaData = function(mediaType, requestURL, callback) {
			var httpRequest = new XMLHttpRequest(),
				responseData,
				parsedData,
				// Response handler
				getResponse = function() {
					try {
						if (httpRequest.readyState === 4) {
							if (httpRequest.status >= 200 && httpRequest.status < 300) {
								responseData = httpRequest.responseText;
								parsedData = JSON.parse(responseData);
								switch (mediaType) {
									case 'video':
										// Do nothing
										break;
									case 'playlist':
									  // Return the parsed data from the Playback API response
										callback(parsedData);
										break;
								}
							} else {
								alert('There was a problem with the request. Request returned ' + httpRequest.status);
							}
						}
					} catch (e) {
						alert('Caught Exception: ' + e);
					}
				};
			// Set the response handler
			httpRequest.onreadystatechange = getResponse;
			// Open the request
			httpRequest.open('GET', requestURL);
			// Set headers
			httpRequest.setRequestHeader('Accept', 'application/json;pk=' + policyKey);
			// Open and send request
			httpRequest.send();
		};

});
