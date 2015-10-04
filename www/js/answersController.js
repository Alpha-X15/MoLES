function getAnswerText()
{
  var textanswer = $('#textAnswerArea').val();
  app.report(textanswer);
  var date = new Date();
  var time = date.getTime();
  var name = 'textanswer_'+time;
  app.report(name);

  storeAnswer('Text', name, textanswer);
}

function getAnswerAudio()
{
  app.report("should start audio");
  var captureSuccess = function(mediaFiles)
  {
    var i, path, len, name;
    for (i = 0, len = mediaFiles.length; i < len; i += 1)
    {
        path = mediaFiles[i].fullPath;
        oldname = mediaFiles[i].name;
        app.report(oldname);

        window.resolveLocalFileSystemURL(
          path,
          function(fileEntry)
          {
            newFileUri = app.devinfo.directory+"files/answers";
            oldFilrUri = path;
            newname = oldname;
            window.resolveLocalFileSystemURL(newFileUri, function(dirEntry)
            {
              fileEntry.moveTo(dirEntry, newname, successAudioCallback, errorCallback);
            }, errorCallback);
          },errorCallback);
      }
    };

    var captureError = function(error)
    {
      navigator.notification.alert('Error code: '+error.code, null, 'Capture Error');
    }

    navigator.device.capture.captureAudio(captureSuccess, captureError, {limit: 1});
}

function getAnswerPicture()
{
  var captureSuccess = function(mediaFiles)
  {
    var i, path, len, name;
    for (i = 0, len = mediaFiles.length; i < len; i += 1)
    {
        path = mediaFiles[i].fullPath;

        oldname = mediaFiles[i].name;
        window.resolveLocalFileSystemURL(
          path,
          function(fileEntry)
          {
            // app.report(JSON.stringify(fileEntry, null, 4));
            newFileUri = app.devinfo.directory+"files/answers";
            app.report(newFileUri);
            oldFilrUri = path;
            newname = oldname;

            window.resolveLocalFileSystemURL(newFileUri, function(dirEntry)
            {
              // app.report(JSON.stringify(dirEntry, null, 4));
              fileEntry.moveTo(dirEntry, newname, successPictureCallback, errorCallback);
            }, errorCallback);
          },errorCallback);
    }
  };

  // capture error callback
  var captureError = function(error)
  {
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
  };

  // start image capture
  navigator.device.capture.captureImage(captureSuccess, captureError, {limit:1});
}

function getAnswerVideo()
{
  // capture callback
  var captureSuccess = function(mediaFiles)
  {
    var i, path, len, name;
    for (i = 0, len = mediaFiles.length; i < len; i += 1)
    {
        path = mediaFiles[i].fullPath;

        oldname = mediaFiles[i].name;
        app.report(oldname);

        window.resolveLocalFileSystemURL(
          path,
          function(fileEntry)
          {
            newFileUri = app.devinfo.directory+"files/answers";
            oldFilrUri = path;
            newname = oldname;

            window.resolveLocalFileSystemURL(newFileUri, function(dirEntry)
            {
              fileEntry.moveTo(dirEntry, newname, successVideoCallback, errorCallback);
            }, errorCallback);
          },errorCallback);
    }
  };

  // capture error callback
  var captureError = function(error)
  {
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
  };

  // start video capture
  navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1});
}

function errorCallback(error)
{
  app.report("Error "+ error.code);
  app.report(JSON.stringify(error, null, 4));
}

function successAudioCallback(entry)
{
  app.report("newpath "+entry.fullPath);
  app.report(JSON.stringify(entry, null, 4));
  storeAnswer("Audio", entry.name, entry.nativeURL);
}

function successVideoCallback(entry)
{
  app.report("newpath "+entry.fullPath);
  app.report(JSON.stringify(entry, null, 4));
  storeAnswer("Video", entry.name, entry.nativeURL);
}

function successPictureCallback(entry)
{
  app.report("newpath "+entry.fullPath);
  app.report(JSON.stringify(entry, null, 4));
  storeAnswer("Picture", entry.name, entry.nativeURL);
}
