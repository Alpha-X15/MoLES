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
    alert("AudioCaptureSuccess");
    var path, name;
    app.report(JSON.stringify(mediaFiles, null, 4));

    if(app.devinfo.platform === "iOS")
    {
      path = "file://"+mediaFiles[0].fullPath;
    }
    else
    {
      path = mediaFiles[0].fullPath;
    }

    oldname = mediaFiles[0].name;
    app.report(oldname);
    var date = new Date();
    var time = date.getTime();

    window.resolveLocalFileSystemURL(
      path,
      function(fileEntry)
      {
        newFileUri = app.devinfo.directory+"files/answers";

        if(app.devinfo.platform === "iOS")
        {
          newFileUri = app.devinfo.directory+"answers";
        }

        oldFilrUri = path;
        newname = 'audio_'+time;
        window.resolveLocalFileSystemURL(newFileUri, function(dirEntry)
        {
          fileEntry.moveTo(dirEntry, newname, successAudioCallback, errorMoveCallback);
        }, errorSecondCallback);
      },errorCallback);
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
    alert("PictureCaptureSuccess");
    var path, name;

    if(app.devinfo.platform === "iOS")
    {
      path = "file://"+mediaFiles[0].fullPath;
    }
    else
    {
      path = mediaFiles[0].fullPath;
    }

    alert(path);
    oldname = mediaFiles[0].name;

    var date = new Date();
    var time = date.getTime();

   window.resolveLocalFileSystemURL(
        path,
        function(fileEntry)
        {
          // app.report(JSON.stringify(fileEntry, null, 4));
          newFileUri = app.devinfo.directory+"files/answers";

          if(app.devinfo.platform === "iOS")
          {
            newFileUri = app.devinfo.directory+"answers";
          }

          app.report(newFileUri);
          //alert(newFileUri);
          oldFileUri = path;
          alert(newFileUri+"<br>"+oldFileUri);
          newname = 'picture_'+time;

          window.resolveLocalFileSystemURL(newFileUri, function(dirEntry)
          {
            // app.report(JSON.stringify(dirEntry, null, 4));
            fileEntry.moveTo(dirEntry, newname, successPictureCallback, errorMoveCallback);
          }, errorSecondCallback);
        },errorCallback);
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
    alert("VideoCaptureSuccess");
    var path, name;

    if(app.devinfo.platform === "iOS")
    {
      path = "file://"+mediaFiles[0].fullPath;
    }
    else
    {
      path = mediaFiles[0].fullPath;
    }

    oldname = mediaFiles[0].name;
    app.report(oldname);
    var date = new Date();
    var time = date.getTime();

    window.resolveLocalFileSystemURL(
      path,
      function(fileEntry)
      {
        newFileUri = app.devinfo.directory+"files/answers";

        if(app.devinfo.platform === "iOS")
        {
          newFileUri = app.devinfo.directory+"answers";
        }
        
        oldFilrUri = path;
        newname = 'video_'+time;

        window.resolveLocalFileSystemURL(newFileUri, function(dirEntry)
        {
          fileEntry.moveTo(dirEntry, newname, successVideoCallback, errorMoveCallback);
        }, errorSecondCallback);
      },errorCallback);
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
  alert("FirstError "+ error.code);
  app.report(JSON.stringify(error, null, 4));
}

function errorSecondCallback(error)
{
  app.report("Error "+ error.code);
  alert("Second resolve Error "+ error.code);
  app.report(JSON.stringify(error, null, 4));
}

function errorMoveCallback(error)
{
  app.report("Error "+ error.code);
  alert("MOVE TO Error "+ error.code);
  app.report(JSON.stringify(error, null, 4));
}

function successAudioCallback(entry)
{
  app.report("newpath "+entry.fullPath);
  alert("newpath "+entry.fullPath);
  app.report(JSON.stringify(entry, null, 4));
  storeAnswer("Audio", entry.name, entry.nativeURL);
}

function successVideoCallback(entry)
{
  app.report("newpath "+entry.fullPath);
  alert("newpath "+entry.fullPath);
  app.report(JSON.stringify(entry, null, 4));
  storeAnswer("Video", entry.name, entry.nativeURL);
}

function successPictureCallback(entry)
{
  app.report("newpath "+entry.fullPath);
  alert("newpath "+entry.fullPath);
  app.report(JSON.stringify(entry, null, 4));
  storeAnswer("Picture", entry.name, entry.nativeURL);
}
