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
