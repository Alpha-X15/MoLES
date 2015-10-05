/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    cons:
    {
      // SERVER_URL: 'http://141.83.80.180/',
      SERVER_URL: 'http://molescore.mesh.de/',
      LOGIN_URL: 'users/canLogin.json',
      GAMELIST_URL: 'gameInstances/index/index.json',
      LOCATION_URL: 'gameInstanceLocations/getUserLastLocations/instance:1.json',
      LOCATION_URL2: 'gameInstanceLocations/add.json',
      // ALLMISSIONS_URL: '/games/view/{GameID}.json',
      ALLMISSIONS_URL: '/games/view/{GameID}.json',
      // GAMEIMAGE_URL: '/molesmedia/image/normal/rgb/640x640/{Filename}',
      GAMEIMAGE_URL: 'molesmedia/image/thumb/cropped/320x320/{Filename}',
      REGISTERANSWER_URL: 'gameInstanceAnswers/add.json',
      UPLOADANSWER_URL: 'Media/upload.json',
    },
    devinfo:
    {
      platform: '',
      directory: '',
      connection: '',
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        // navigator.splashscreen.show();
        app.receivedEvent('deviceready');
        app.devinfo.platform = window.device.platform;

        checkConnection();
        localStorage.clear();
        StatusBar.hide();
        setUpDatabase();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        app.report('Received Event: ' + id);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);


        // Test for getting OS and version
        app.report(window.device.platform);
        app.report(window.device.version);
        app.report(JSON.stringify(cordova.file, null, 4));

        $(document).on("pageshow","#maps_page",function()
        {
            initializeMap();
        });

        $(document).on('click', '#submitButton', function(e)
        {
          loginWebservice($('input[name=username]').val(), $('input[name=password]').val());
        });

        $(document).on('click', '#OfflineTestButton', function(e)
        {
          offlineLogin($('input[name=username]').val(), getAuth($('input[name=username]').val(), $('input[name=password]').val()));
        });

        $(document).on("pagebeforeshow", "#games_page", function()
        {
          $('#gameList').listview("refresh");
        });

        $(document).on("pagebeforeshow", "#places_page", function()
        {
          $('#placesList').listview("refresh");
        });

        $(document).on("pagebeforeshow", "#questions_list_page", function()
        {
          $('#taskList').listview("refresh");
        });

        $(document).on("pagebeforeshow", "#textanswer_page", function()
        {
          $('#textAnswerArea').val('');
        });

        $(document).on("pageshow", "#upload_page", function()
        {
          app.report(checkConnection());
        });
    },
    report: function(id)
    {
        console.log("Report: "+ id);
    }
};

function onFileSystemSuccess(fileSystem)
{
  // app.report("FileSystemSuccess");
  // app.report(app.devinfo.platform);
  var directoryEntry = fileSystem.root;

  if(app.devinfo.platform == "iOS")
  {
    app.devinfo.directory = cordova.file.documentsDirectory;
    window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, function(entry)
    {
      var natiurl = entry.fullPath;
      directoryEntry.getDirectory(natiurl+"answers", {create: true, exclusive: false}, function(parent)
      {
        alert(parent.name);
        app.report(parent.name);
      },
      function(error)
      {
        alert("Error while making directory "+JSON.stringify(error, null, 4));
        app.report("Error while making directory "+JSON.stringify(error, null, 4));
      });
    });
  }
  else
  {
    if(cordova.file.externalDataDirectory != null)
    {
      // app.report("externalDataDirectory");
      app.devinfo.directory = cordova.file.externalApplicationStorageDirectory;
      window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function(entry)
      {
        // app.report(JSON.stringify(entry, null, 4));
        var natiurl = entry.fullPath;
        // app.report(natiurl);
        directoryEntry.getDirectory(natiurl+"files/answers", {create: true, exclusive: false}, function(parent)
        {
          app.report(parent.name);
        },
        function(error)
        {
          app.report("Error while making directory "+JSON.stringify(error, null, 4));
        });
      });
    }
    else
    {
      app.report("dataDirectory");
      app.devinfo.directory = cordova.file.dataDirectory;
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(entry)
      {
        var natiurl = entry.fullPath;
        directoryEntry.getDirectory(natiurl+"answers", {create: true, exclusive: false}, function(parent)
        {
          app.report(parent.name);
        },
        function(error)
        {
          app.report("Error while making directory "+JSON.stringify(error, null, 4));
        });
      });
    }
  }
}

function onFileSystemFail(evt)
{
    app.report(evt.target.error.code);
}

/*
* function for building an authtoken for authentification
*/
function getAuth(name, pwd)
{
    var bytes = Crypto.charenc.Binary.stringToBytes(name+':'+pwd);
    var base64 = Crypto.util.bytesToBase64(bytes);
    app.report(base64);
    return "Basic " + base64;
}

function checkConnection()
{
    var networkState = navigator.connection.type;

    app.report(networkState);
    var states = {};
    states[Connection.UNKNOWN]  = 'Bad';
    states[Connection.ETHERNET] = 'Best';
    states[Connection.WIFI]     = 'Best';
    states[Connection.CELL_2G]  = 'Bad';
    states[Connection.CELL_3G]  = 'Great';
    states[Connection.CELL_4G]  = 'Great';
    states[Connection.CELL]     = 'Bad';
    states[Connection.NONE]     = 'None';

    app.report(JSON.stringify(states, null, 4));
    return states[networkState];
    // alert('Connection type: '+ states[networkState]);
}

function showHelpPage(sourceID)
{
  localStorage.setItem('_helpFor', sourceID);
  $('#helpText').empty();
  $('#helpText').append("Hier sollte die Hilfe für die "+sourceID+" stehen ");
  $.mobile.changePage($('#help_page'));
}

function backTo(sourceID)
{
  app.report("backTo");
  if(sourceID == "#help_page")
  {
    $.mobile.changePage($(localStorage.getItem('_helpFor')));
  }
  else if (sourceID == "#upload_page")
  {
    $.mobile.changePage($(localStorage.getItem('_uploadFrom')));
  }
}

// function playAudio(url)
// {
//     // Play the audio file at url
//     app.report("Should play audio");
//     var my_media = new Media(url,
//         // success callback
//         function () {
//             app.report("playAudio():Audio Success");
//         },
//         // error callback
//         function (err) {
//             app.report("playAudio():Audio Error: " + err);
//         }
//     );
//     // Play audio
//     my_media.play();
// }

function initializeMap()
{
    var map = L.map('map',{
      center: [51.505, -0.09],
      zoom: 13
    });

    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',{
      maxZoom: 18
    }).addTo(map);
}
