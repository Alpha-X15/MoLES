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
      // connection: '',
      map_center:
      {

      },
      map_marker:
      {

      },
      marker_layer:[],
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        fastclick.attach(document.body);
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
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');
        //
        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');
        app.report('Received Event: ' + id);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);

        // Test for getting OS and version
        app.report(window.device.platform);
        app.report(window.device.version);
        app.report(JSON.stringify(cordova.file, null, 4));

        $(document).on("pageshow","#maps_page",function()
        {
          $.mobile.activePage.find('.map').leaflet();
          var mapDiv = $('#map');
          mapDiv.height($(window).height() - mapDiv.offset().top);
          mapDiv.width($(window).width() - mapDiv.offset().left);

          var map = $('#map').leaflet('getMap');
          map.setView(app.devinfo.map_center);

          if(app.devinfo.marker_layer.length > 0)
          {
            for(var layermarker in app.devinfo.marker_layer)
            {
              map.removeLayer(app.devinfo.marker_layer[layermarker]);
            }
          }

          var mymarker;
          for(var marker in app.devinfo.map_marker)
          {
            var myicon = L.icon({
              iconUrl: 'img/marker.png',
              iconSize: [38, 68],
              iconAnchor: [22, 94]
            });
            mymarker = L.marker(app.devinfo.map_marker[marker], {icon: myicon});
            map.addLayer(mymarker);
            app.devinfo.marker_layer.push(mymarker);
          }
        });

        $(document).on('click', '#submitButton', function(e)
        {
          if(checkConnection() == "None")
          {
            offlineLogin($('input[name=username]').val(), getAuth($('input[name=username]').val(), $('input[name=password]').val()));
          }
          loginWebservice($('input[name=username]').val(), $('input[name=password]').val());
        });

        // $(document).on('click', '#OfflineTestButton', function(e)
        // {
        //   offlineLogin($('input[name=username]').val(), getAuth($('input[name=username]').val(), $('input[name=password]').val()));
        // });

        $(document).on("pagebeforeshow", "#games_page", function()
        {
          $('#gameList').listview("refresh");
        });

        $(document).on("pagebeforeshow", "#places_page", function()
        {
          $('#placesList').listview("refresh");
        });

        $(document).on("pageshow", "#places_page", function()
        {
          getMapMarkers(localStorage.getItem('_choosendGameID'));
        });

        $(document).on("pagebeforeshow", "#questions_list_page", function()
        {
          $('#taskList').listview("refresh");
        });

        $(document).on("pagebeforeshow", "#textanswer_page", function()
        {
          $('#textAnswerArea').val('');
        });

        $(document).on("pagebeforeshow", "#answers_page", function()
        {
          $('#answersList').listview("refresh");
        });

        $(document).on("pagebeforeshow", "#answer_detail_page", function()
        {
          $('.playBtn').buttonMarkup();
          $('.deleteBtn').buttonMarkup();
          $('#textAnswerChangeArea').textinput();
        });

        $(document).on("pageshow", "#upload_page", function()
        {
          if(checkConnection() == "Bad")
          {
            alert("Deine Internetverbindung ist sehr schlecht. Da viele Daten übertragen werden müssen solltest du dich besser in ein WLAN begeben. Es können Kosten für die Datenübertragung anfallen.");
          }
          else if (checkConnection() == "None")
          {
            alert("Es scheint als hättest du keine Internetverbindung. Ohne stabile Internetverbindung ist der Upload nicht möglich.");
          }
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
        //alert(parent.name);
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

    // app.report(JSON.stringify(states, null, 4));
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

function showMapsPage(sourceID)
{
  localStorage.setItem('_MapsFrom', sourceID);
  $.mobile.changePage($('#maps_page'));
}

function backTo(sourceID)
{
  app.report("backFrom "+sourceID);
  if(sourceID == "#help_page")
  {
    $.mobile.changePage($(localStorage.getItem('_helpFor')));
  }
  else if (sourceID == "#upload_page")
  {
    $.mobile.changePage($(localStorage.getItem('_uploadFrom')));
  }
  else if (sourceID == "#maps_page")
  {
    var pageTo = localStorage.getItem('_MapsFrom');
    $.mobile.changePage($(pageTo));
  }
}

function setIdForAnswerOptions(task_id, answer_id)
{
  localStorage.setItem('_answerOption', answer_id);
}

function playPauseVideo()
{
    app.report("play/pause");
    var myVideo = $("#answer_video").get(0);

    if (myVideo.paused)
        myVideo.play();
    else
        myVideo.pause();
}

function playAudio()
{
    var audio = JSON.parse(localStorage.getItem('_answerDetail'));
    var path = audio.answer_value;
    var durDisplay='';
    // Play the audio file at url
    app.report("Should play audio "+audio.answer_value);
    var my_media = new Media(path,
        // success callback
        function ()
        {
            app.report("playAudio():Audio Success");
        },
        // error callback
        function (err)
        {
            app.report("playAudio():Audio Error: " + err);
        },
        function (status)
        {
          app.report(status);
        }
    );
    // Play audio
    my_media.play();

    var counter = 0;
    var timerDur = setInterval(function()
    {
      counter = counter + 100;
      if (counter > 2000)
      {
        clearInterval(timerDur);
      }

      var dur = my_media.getDuration();
      if (dur > 0)
      {
        clearInterval(timerDur);

        var duration = Math.ceil(dur);
        var durMinutes = Math.floor(duration/60);
        // var durSeconds = duration-(durMinutes*60);
        var durSeconds = (duration % 60)-1;

        durDisplay = str_pad_left(durMinutes, '0', 2)+':'+str_pad_left(durSeconds, '0', 2);
      }
    }, 100);

    var mediaTimer = setInterval(function ()
    {
      // get media position
      my_media.getCurrentPosition(
        // success callback
        function (position)
        {
            if (position >= 0)
            {
                var actPos = Math.ceil(position);
                var actMinutes = Math.floor(actPos/60);
                var actSeconds = actPos % 60;
                var actDisplay = str_pad_left(actMinutes, '0', 2)+':'+str_pad_left(actSeconds, '0', 2);

                $('#audioTime').empty();
                $('#audioTime').append(actDisplay+"/"+durDisplay);
                app.report(actDisplay + " / "+durDisplay);
            }
        },
        // error callback
        function (e)
        {
            app.report("Error getting pos=" + e);
        });
    }, 1000);
}

function str_pad_left(string,pad,length)
{
    return (new Array(length+1).join(pad)+string).slice(-length);
}
