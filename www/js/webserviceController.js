/*
* Ajax request for login
*/
function loginWebservice(user, passw)
{
  localStorage.setItem('_userID', '0');

  $.ajax({
      url: app.cons.SERVER_URL + app.cons.LOGIN_URL,
      dataType: 'json',
      xhrFields:
      {
          withCredentials: true
      },
      crossDomain: true,
      beforeSend: function(xhr)
      {
					$.mobile.loading('show',
	        {
	          text: "Login läuft...",
	          textVisible: true,
	          theme: 'a',
	          html: ""
	        });
          xhr.setRequestHeader('Authorization', getAuth(user, passw));
          xhr.setRequestHeader('pragma', 'no-cache');
          xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      },
      success: function(msg)
      {
        app.report(JSON.stringify(msg.data, null, 4));
        if(msg.data.valid == true)
        {
          localStorage.setItem('_userID', msg.data.id);
          localStorage.setItem('_loggedIn', "true");
          localStorage.setItem('_authToken', getAuth(user, passw));

          storeUserLogin(msg.data.id, user, getAuth(user, passw), "true");
					$.mobile.loading('hide');
          getGameList();
        }
        else if (msg.data.valid == false)
        {
						$.mobile.loading('hide');
            $('#loginErrorText').append("Es scheint sich ein Fehler in deinen Zugangsdaten eingeschlichen zu haben. Probiere es bitte erneut.");
        }
      }
  })
  .fail(function(jqXHR, textStatus)
  {
      app.report("Status: " + jqXHR.status);
      app.report("Login request failed: " + textStatus);
			$.mobile.loading('hide');
      $('#loginErrorText').append('Der Login ist fehlgeschlagen. Probiere es bitte erneut.');

  });
}

/*
* Ajax call for loading the gamelist for the actual user from a webservice.
* Builds the gamelist and changes to gamespage.
*/
function getGameList()
{
    app.report("getGameList");
    $.ajax(
    {
        url: app.cons.SERVER_URL + app.cons.GAMELIST_URL,
        dataType: 'json',
        xhrFields:
        {
            withCredentials: true
        },
        crossDomain: true,
        type: 'GET',
        beforeSend: function(xhr)
        {
						$.mobile.loading('show',
	        	{
	          	text: "Es werden Spiele für dich heruntergeladen...",
	          	textVisible: true,
	          	theme: 'a',
	          	html: ""
	        	});
            xhr.setRequestHeader('Authorization', localStorage.getItem('_authToken'));
            xhr.setRequestHeader('pragma', 'no-cache');
            xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        },
        success: function(msg)
        {
          var gameInstances = msg.data.gameInstances;
          // storeGameList(localStorage.getItem('_userID'), gameInstances);

          $('#gameList').empty();
          var gamesListContent = '';
          for(var i = 0; i<gameInstances.length; i++)
          {
              gamesListContent += '<li id="'+gameInstances[i]["GameInstance"]["id"]+'-'+gameInstances[i]["GameInstance"]["game_id"]+'-'+gameInstances[i]["GameInstance"]["name"]+'"><input type="hidden" id="game_'+gameInstances[i]["GameInstance"]["id"]+'" value="'+encodeURIComponent(JSON.stringify(gameInstances[i]))+'"><a href="javaScript:void(0)">'+gameInstances[i]["GameInstance"]["name"]+'</a></li>';
          }
          $('#gameList').append(gamesListContent);

          $('#gameList').off('click', 'li');

          $('#gameList').on('click', 'li', function()
          {
            var cgame = $(this).attr('id').split('-');
            var gameObj = JSON.parse(decodeURIComponent($('#game_'+cgame[0]).val()));

            localStorage.setItem('_choosendGameID', cgame[1]);
            localStorage.setItem('_ActiveInstanceID', cgame[0]);
            getLocationList(cgame[1], cgame[2], gameObj);
          });

					$.mobile.loading('hide');
          $.mobile.changePage($('#games_page'));
        }
    })
    .fail(function(jqXHR, textStatus)
    {
        app.report("StatusCode: "+jqXHR.status);
        app.report("Status: "+textStatus);
        app.report("Failed loading the GameList");
				$.mobile.loading('hide');
				alert("Es konnten leider keine Spiele für dich heruntergeladen werden.");
				$.mobile.changePage($('#games_page'));
    });
}

/**
* Get list of locations from webservice
*
*/
function getLocationList(choosen_game_id, game_name, gameObj)
{
    $.ajax(
    {
        url: app.cons.SERVER_URL + app.cons.ALLMISSIONS_URL.replace("{GameID}", choosen_game_id),
        dataType: 'json',
        xhrFields:
        {
            withCredentials: true
        },
        crossDomain: true,
        type: 'GET',
        beforeSend: function(xhr)
        {
						$.mobile.loading('show',
		        {
		          text: "Es werden die Daten für das gewählte Spiel "+game_name+" heruntergeladen.",
		          textVisible: true,
		          theme: 'a',
		          html: ""
		        });
            xhr.setRequestHeader('Authorization', localStorage.getItem('_authToken'));
            xhr.setRequestHeader('pragma', 'no-cache');
            xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
    })
    .done(function(data, textStatus, jqXHR)
    {
        app.report("LocationList Loaded");

        var placeInstances = data.data.game;

        storeGame(localStorage.getItem('_userID'), gameObj);
        storeLocationList(localStorage.getItem('_userID'), placeInstances);

        $('#placesTitle').empty();
        $('#placesText').empty();
        $('#placesTitle').append(game_name);
        $('#placesText').append(placeInstances["Game"]["description"]);

        $('#placesList').empty();
        var placesListContent = '';
        for(var i = 0; i<placeInstances["Mission"].length; i++)
        {
            placesListContent += '<li id="'+placeInstances["Mission"][i]["id"]+'-'+placeInstances["Mission"][i]["name"]+'"><a href="javaScript:void(0)">'+placeInstances["Mission"][i]["name"]+'</a></li>';
        }
        $('#placesList').append(placesListContent);

        $('#placesList').off('click', 'li');

        // $('#placesList').delegate('li', 'click', function()
        $('#placesList').on('click', 'li', function()
        {
          var cplace = $(this).attr('id').split('-');
          app.report(cplace[0]+' '+cplace[1]);
          buildTaskPage(cplace[0]);
        });

				$.mobile.loading('hide');
        $.mobile.changePage($('#places_page'));
    })
    .fail(function(jqXHR, textStatus)
    {
        app.report("StatusCode: "+jqXHR.status);
        app.report("Status: "+textStatus);
        app.report("Failed loading the LocationList");
				$.mobile.loading('hide');
				alert("Es konnten leider keine Daten zu dem gewünschten Spiel runtergeladen werden.");
    });
}

/**
* Pull images from molesserver for each loaction and question
*/
function getRESTImages(imageList)
{
	var count = 0;
	for(var image in imageList)
	{
		var filename = imageList[image]["file"];

		var fileTransfer = new FileTransfer();
		var uri = encodeURI(app.cons.SERVER_URL+app.cons.GAMEIMAGE_URL.replace('{Filename}', filename));

		app.report(app.devinfo.directory);
		var fileURL;

		fileURL = app.devinfo.directory+"images/task/"+filename;

		imageList[image]["filepath"] = fileURL;

		fileTransfer.download(
			uri,
			fileURL,
			function(entry)
			{
				count++;
				if(count == imageList.length)
				{
          for(var media in imageList)
          {
            storeImages(localStorage.getItem('_userID'), imageList[media]);
          }
					// storeImages(localStorage.getItem('_userID'), imageList);
				}
			},
			function(error)
			{
				app.report("download error source " + error.source);
	    	app.report("download error target " + error.target);
			},
			false,
			{
				headers:
				{
					"Authorization": localStorage.getItem('_authToken')
				}
			}
		);
	}
}

function prepareAnswerUpload(answer)
{
	app.report(JSON.stringify(answer, null, 4));
	app.report("Prepare Answer Upload");
	if (answer.answer_type == 'Picture')
	{
				uploadAnswer(answer.id, answer.task_id, answer.answer_value, answer.answer_name, 'image/*');
	}
	else if (answer.answer_type == 'Video')
	{
				uploadAnswer(answer.id, answer.task_id, answer.answer_value, answer.answer_name, 'video/*');
	}
	else if (answer.answer_type == 'Audio')
	{
				uploadAnswer(answer.id, answer.task_id, answer.answer_value, answer.answer_name, 'audio/*');
	}
	else if (answer.answer_type == 'Text')
	{
				registerAnswer(function success(msg)
				{
					app.report("Textanswer uploaded."+JSON.stringify(msg, null, 4));
					var uploads = localStorage.getItem('_uploadQueue');
					uploads -= 1;
					localStorage.setItem('_uploadQueue', uploads);
					updateAnswersList(answer.id);
					if(uploads == 0)
					{
						$.mobile.loading('hide');
						if(localStorage.getItem('_uploadFailure') == true)
						{
							alert('Während des Uploads ist ein Fehler aufgetreten. Möglicherweise wurden nicht alle Antworten hochgeladen. Bitte versuche es mit stabiler Internetverbindung erneut.');
							getAnswersUploadCount();
						}
						else
						{
							alert("Es sind alle antworten erfolgreich hochgeladen worden.");
							$.mobile.changePage($('#games_page'));
						}
					}
				},
				function error(error)
				{
					app.report("Textanswer upload failed "+JSON.stringify(error, null, 4));

					var uploads = localStorage.getItem('_uploadQueue');
					uploads -= 1;
					localStorage.setItem('_uploadQueue', uploads);
					if(uploads == 0)
					{
						$.mobile.loading('hide');
						if(localStorage.getItem('_uploadFailure') == true)
						{
							alert('Während des Uploads ist ein Fehler aufgetreten. Möglicherweise wurden nicht alle Antworten hochgeladen. Bitte versuche es mit stabiler Internetverbindung erneut.');
							getAnswersUploadCount();
						}
					}
				}, answer.task_id, answer.answer_value);
		}
}

function uploadAnswer(internalID, taskId, answerURI, answerName, mimetype)
{
		app.report("Upload answer");
		registerAnswer(function success(data)
		{
			app.report("Answer registered.");
			app.report(JSON.stringify(data.data.gameInstanceAnswer, null, 4));
			var answerID = data.data.gameInstanceAnswer.substr(data.data.gameInstanceAnswer.lastIndexOf('/')+1);
			uploadMedia(internalID, answerID, answerName, answerURI, mimetype);
		},
		function error(error)
		{
			app.report('Answer registration failed.');
			localStorage.setItem('_uploadFailure', true);
			var uploads = localStorage.getItem('_uploadQueue');
			uploads -= 1;
			localStorage.setItem('_uploadQueue', uploads);
			if(uploads == 0)
			{
				$.mobile.loading('hide');
				alert('Während des Uploads ist ein Fehler aufgetreten. Möglicherweise wurden nicht alle Antworten hochgeladen. Bitte versuche es mit stabiler Internetverbindung erneut.');
				getAnswersUploadCount();
			}
		},
		taskId,
		''
		);
}

function registerAnswer(success, error, taskId, text)
{
	app.report("register answer");
	app.report("active: "+localStorage.getItem('_ActiveInstanceID'));
	app.report("user "+localStorage.getItem("_userID"));
	app.report("auth "+localStorage.getItem("_authToken"));
	// var date = new Date();
	// var time = date.getTime();
	var time = Math.round(+new Date()/1000);
	app.report(time);
	var answer = new FormData();

  answer.append("data[GameInstanceAnswer][question_id]", taskId);
  answer.append("data[GameInstanceAnswer][game_instance_id]", localStorage.getItem("_ActiveInstanceID"));
  answer.append("data[GameInstanceAnswer][user_id]", localStorage.getItem("_userID"));
  answer.append("data[GameInstanceAnswer][answer]", text);
  answer.append("data[GameInstanceAnswer][timestamp_client]", time);

	$.ajax({
		url: app.cons.SERVER_URL+app.cons.REGISTERANSWER_URL,
		xhrFields:
		{
				withCredentials: true
		},
		crossDomain: true,
		type: 'POST',
		beforeSend: function(xhr)
		{
				app.report("Before Send");
				xhr.setRequestHeader('Authorization', localStorage.getItem('_authToken'));
				xhr.setRequestHeader('pragma', 'no-cache');
				xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		},
		data: answer,
		contentType: false,
		processData: false,
		success: success,
		error: error
	});
}

function uploadMedia(internalID, answerID, answerName, fileURI, mimeType)
{
	var uploadSuccess = function(response)
	{
		app.report("Code "+response.responseCode);
		app.report("Response "+response.response);
		app.report("Sent "+response.bytesSent);

		var uploads = localStorage.getItem('_uploadQueue');
		app.report(uploads);
		uploads -= 1;
		localStorage.setItem('_uploadQueue', uploads);
		updateAnswersList(internalID);
		if(uploads == 0)
		{
			$.mobile.loading('hide');
			if(localStorage.getItem('_uploadFailure') == true)
			{
				alert('Während des Uploads ist ein Fehler aufgetreten. Möglicherweise wurden nicht alle Antworten hochgeladen. Bitte versuche es mit stabiler Internetverbindung erneut.');
				getAnswersUploadCount();
			}
			else
			{
				alert("Es sind alle Antworten erfolgreich hochgeladen worden.");
				$.mobile.changePage($('#games_page'));
			}
		}
	}

	var uploadFail = function(error)
	{
		app.report(JSON.stringify(error, null, 4));
		app.report("Error code "+error.code);
		app.report("Error source "+error.source);
		app.report("Error target "+error.target);

		localStorage.setItem('_uploadFailure', true);
		var uploads = localStorage.getItem('_uploadQueue');
		uploads -= 1;
		localStorage.setItem('_uploadQueue', uploads);
		if(uploads == 0)
		{
			$.mobile.loading('hide');
			alert('Während des Uploads ist ein Fehler aufgetreten. Möglicherweise wurden nicht alle Antworten hochgeladen. Bitte versuche es mit stabiler Internetverbindung erneut.');
		}
	}

	var options = new FileUploadOptions();
	options.fileKey="data[Media][file]";
	options.filenName=answerName;
	options.mimeType=mimeType;
	options.chunkedMode=false;

	var params = {
		'data[Media][title]': 'test',
		'data[Media][relation_model]': 'game_instance_answer',
		'data[Media][relation_id]': 'game_instance_answer_'+answerID,
		'data[Media][file][name]': 'test'
	};
	options.params = params;
	options.header = {
		'Authorization': localStorage.getItem('_authToken'),
		'pragma': 'no-cache',
		'Cache-Control': 'no-cache,max-age=0',
		'X-Requested-With': 'XMLHttpRequest',
		'Connection': 'close'
	};

	var ft = new FileTransfer();
	ft.upload(fileURI, app.cons.SERVER_URL+app.cons.UPLOADANSWER_URL, uploadSuccess, uploadFail, options);
}
