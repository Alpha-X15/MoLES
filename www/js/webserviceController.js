function getRESTImages(imageList)
{
	var count = 0;
	for(var image in imageList)
	{
		var filename = imageList[image]["file"];

		var fileTransfer = new FileTransfer();
		var uri = encodeURI(app.cons.SERVER_URL+app.cons.GAMEIMAGE_URL.replace('{Filename}', filename));

		var fileURL;
		if(window.device.platform == "Android")
		{
			fileURL = cordova.file.externalApplicationStorageDirectory+"images/task/"+filename;

			if(!fileURL)
			{
				fileURL = cordova.file.dataDirectory+"files/images/task/"+filename;
			}
		}
		else if(window.device.platform == "iOS")
		{
			fileURL = cordova.file.dataDirectory+"images/task/"+filename;
		}

		imageList[image]["filepath"] = fileURL;

		fileTransfer.download(
			uri,
			fileURL,
			function(entry)
			{
				count++;
				if(count == imageList.length)
				{
					storeImages(localStorage.getItem('_userID'), imageList);
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
	if (answer.answer_type == 'Picture'){
				uploadAnswer(answer.task_id, answer.answer_value, answer.answer_name, 'image/*');
		} else if (answer.type == 'Video'){
				uploadAnswer(answer.task_id, answer.answer_value, answer.answer_name, 'video/*');
		} else if (answer.type == 'Audio'){
				uploadAnswer(answer.task_id, answer.answer_value, answer.answer_name, 'audio/*');
		} else if (answer.type == 'Text'){
				registerAnswer(function()
				{
					app.report("Textanswer uploaded.");
				},
				function()
				{
					app.report("Textanswer upload failed");
				}, answer.task_id, answer.answer_value);
		}
}

function uploadAnswer(taskId, answerURI, answerName, mimetype)
{
		registerAnswer(function success(data)
		{
			app.report("Answer registered.");
			var answerID = data.data.gameInstanceAnswer.substr(data.data.gameInstanceAnswer.lastIndexOf('/')+1);
			uploadMedia(answerID, answerName, answerURI, mimetype);
		},
		function error(error)
		{
			app.report('Answer registration failed.');
		},
		taskId,
		''
		);
}

function registerAnswer(success, error, taskId, text)
{
	var answer = new FormData();

  answer.append("data[GameInstanceAnswer][question_id]", questionID);
  answer.append("data[GameInstanceAnswer][game_instance_id]", localStorage.getItem("_ActiveInstanceID"));
  answer.append("data[GameInstanceAnswer][user_id]", localStorage.getItem("_UserID"));
  answer.append("data[GameInstanceAnswer][answer]", text);
  answer.append("data[GameInstanceAnswer][timestamp_client]", getTime());

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

function uploadMedia(answerID, answerName, fileURI, mimeType)
{
	var uploadSuccess = function(response)
	{
		app.report("Code "+response.responseCode);
		app.report("Response "+response.response);
		app.report("Sent "+response.bytesSent);
	}

	var uploadFail = function(error)
	{
		app.report("Error code "+error.code);
		app.report("Error source "+error.source);
		app.report("Error target "+error.target);
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
	ft.upload(fileURI, encodeURI(app.cons.SERVER_URL+app.cons.UPLOADANSWER_URL), uploadSuccess, uploadFail, options);
}
