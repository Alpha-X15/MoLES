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
            newFileUri = cordova.file.externalApplicationStorageDirectory+"answers";
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
        app.report(oldname);
        window.resolveLocalFileSystemURL(
          path,
          function(fileEntry)
          {
            newFileUri = cordova.file.externalApplicationStorageDirectory+"answers";
            oldFilrUri = path;
            newname = oldname;

            window.resolveLocalFileSystemURL(newFileUri, function(dirEntry)
            {
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
            newFileUri = cordova.file.externalApplicationStorageDirectory+"answers";
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
