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
        app.report(JSON.stringify(navigator.connection));
        localStorage.clear();

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

        // Test for getting OS and version
        app.report(window.device.platform);
        app.report(window.device.version);

        $(document).on("pageshow","#maps_page",function(){
            initializeMap();
        });

        $(document).on('click', '#submitButton', function()
        {
          loginWebservice($('input[name=username]').val(), $('input[name=password]').val());
        });
    },
    report: function(id)
    {
        console.log("Report: "+ id);
    }
};

function setUpDatabase()
{
  if(window.device.platform == "Android")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", androidLockWorkaround: 1});
  }
  else if(window.device.platform == "iOS")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", location: 1});
  }
  else
  {
    var db =  window.sqlitePlugin.openDatabase({name: "Moles.db"});
  }

  db.transaction(function(tx) {
    tx.executeSql('DROP TABLE IF EXISTS moles_users');
    tx.executeSql('DROP TABLE IF EXISTS moles_games');
    tx.executeSql('DROP TABLE IF EXISTS moles_locations');
    tx.executeSql('DROP TABLE IF EXISTS moles_tasks');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_users (id integer primary key, moles_uid integer, username text, authToken text, validUser text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_games (id integer primary key, moles_uid integer, game_inst_id integer, game_id integer, group_id integer, game_name text, game_description text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_locations (id integer primary key, moles_uid integer, mission_id integer, game_id integer, name text, description text, location text, lat real, lng real)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_tasks (id integer primary key, moles_uid integer, task_id integer, mission_id integer, name text, description text, location text, lat real, lng real)');
  });
}

function storeUserLogin(userid, username, authToken, validUser)
{
  if(window.device.platform == "Android")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", androidLockWorkaround: 1});
  }
  else if(window.device.platform == "iOS")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", location: 1});
  }
  else
  {
    var db =  window.sqlitePlugin.openDatabase({name: "Moles.db"});
  }

  db.transaction(function(tx) {
    tx.executeSql('INSERT INTO moles_users (moles_uid, username, authToken, validUser) VALUES (?,?,?,?)', [userid, username, authToken, validUser], function(tx, res) {
      app.report("InsertedId: "+res.insertId);
      app.report("AffectedRows: "+res.rowsAffected);
    });
  });

  db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM moles_users", [], function(tx, res) {
        app.report("res.rows.length: " + res.rows.length);
        app.report("res.rows.item(0): " + JSON.stringify(res.rows.item(0)));
        app.report("res.rows: "+JSON.stringify(res.rows));
      });
    });
}

function storeGameList(user, gameList)
{
  if(window.device.platform == "Android")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", androidLockWorkaround: 1});
  }
  else if(window.device.platform == "iOS")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", location: 1});
  }
  else
  {
    var db =  window.sqlitePlugin.openDatabase({name: "Moles.db"});
  }

  db.transaction(function(tx){
    for(var i = 0; i<gameList.length; i++)
    {
      tx.executeSql('INSERT INTO moles_games (moles_uid, game_inst_id, game_id, group_id, game_name, game_description) VALUES (?,?,?,?,?,?)',
      [
        user,
        gameList[i]["GameInstance"]["id"],
        gameList[i]["Game"]["id"],
        gameList[i]["GameInstance"]["group_id"],
        gameList[i]["GameInstance"]["name"],
        gameList[i]["Game"]["description"]
      ], function(tx, res)
      {
        app.report("InsertedGameId: "+res.insertId);
      });
    }
  });

  // db.transaction(function(tx) {
  //     tx.executeSql("SELECT * FROM moles_games", [], function(tx, res) {
  //       app.report(" game res.rows.length: " + res.rows.length);
  //       app.report(" game res.rows.item(0): " + JSON.stringify(res.rows.item(0)));
  //     });
  //   });
}

function storeLocationList(user, locationList)
{
  if(window.device.platform == "Android")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", androidLockWorkaround: 1});
  }
  else if(window.device.platform == "iOS")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", location: 1});
  }
  else
  {
    var db =  window.sqlitePlugin.openDatabase({name: "Moles.db"});
  }

  db.transaction(function(tx)
  {
    for(var i = 0; i<locationList["Mission"].length; i++)
    {
      tx.executeSql('INSERT INTO moles_locations (moles_uid, mission_id, game_id, name, description, location, lat, lng) VALUES (?,?,?,?,?,?,?,?)',
      [
        user,
        locationList["Mission"][i]["id"],
        locationList["Mission"][i]["game_id"],
        locationList["Mission"][i]["name"],
        locationList["Mission"][i]["description"],
        locationList["Mission"][i]["location"],
        locationList["Mission"][i]["lat"],
        locationList["Mission"][i]["lng"]
      ], function(tx, res)
      {
        app.report("InsertedLocationId: "+res.insertId);
      });
    }
  });

  var questions = [];
  for(var j = 0; j<locationList["Mission"].length; j++)
  {
    for(var k = 0; k<locationList["Mission"][j]["Question"].length; k++)
    {
        questions.push(locationList["Mission"][j]["Question"][k]);
    }
  }

  db.transaction(function(tx)
  {
    for(var l = 0; l<questions.length; l++)
    {
      tx.executeSql('INSERT INTO moles_tasks (moles_uid, task_id, mission_id, name, description, location, lat, lng) VALUES (?,?,?,?,?,?,?,?)',
      [
        user,
        questions[l]["id"],
        questions[l]["mission_id"],
        questions[l]["name"],
        questions[l]["description"],
        questions[l]["location"],
        questions[l]["lat"],
        questions[l]["lng"]
      ], function(tx, res)
      {
        app.report("inserted task: "+res.insertId);
      });
    }
  });

  // db.transaction(function(tx){
  //   tx.executeSql('SELECT * FROM moles_locations', [], function(tx, res){
  //     app.report("location rows length "+res.rows.length);
  //     app.report("location item 0 "+JSON.stringify(res.rows.item(0)));
  //   });
  // });
  //
  // db.transaction(function(tx){
  //   tx.executeSql('SELECT * FROM moles_tasks', [], function(tx, res){
  //     app.report("tasks rows length "+res.rows.length);
  //     app.report("tasks item 0 "+JSON.stringify(res.rows.item(0)));
  //   });
  // });
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

/*
* Ajax request for login
*/
function loginWebservice(user, passw)
{
  localStorage.setItem('_userID', '0');
  app.report("User: "+user);
  app.report("User: "+passw);

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
          navigator.notification.activityStart('Login..', 'loading');
          xhr.setRequestHeader('Authorization', getAuth(user, passw));
          xhr.setRequestHeader('pragma', 'no-cache');
          xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      },
      success: function(msg)
      {
        if(msg.data.valid == true)
        {
          localStorage.setItem('_userID', msg.data.id);
          localStorage.setItem('_loggedIn', "true");
          localStorage.setItem('_authToken', getAuth(user, passw));

          storeUserLogin(msg.data.id, user, getAuth(user, passw), "true");

          getGameList();
        }
      }
  })
  .fail(function(jqXHR, textStatus)
  {
      app.report("Status: " + jqXHR.status);
      app.report("Login request failed: " + textStatus);
      navigator.notification.activityStop();
      alert("Der Login ist fehlgeschlagen.");
  });
}

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
            xhr.setRequestHeader('Authorization', localStorage.getItem('_authToken'));
            xhr.setRequestHeader('pragma', 'no-cache');
            xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        },
        success: function(msg)
        {
          var gameInstances = msg.data.gameInstances;
          storeGameList(localStorage.getItem('_userID'), gameInstances);
          // localStorage.setItem('_gameList', JSON.stringify(gameInstances));

          var gamesListContent = '';
          for(var i = 0; i<gameInstances.length; i++)
          {
              gamesListContent += '<li id="'+gameInstances[i]["GameInstance"]["game_id"]+'-'+gameInstances[i]["GameInstance"]["name"]+'"><a href="javaScript:void(0)">'+gameInstances[i]["GameInstance"]["name"]+'</a></li>';
          }
          $('#gameList').append(gamesListContent);
          $('#gameList').delegate('li', 'click', function()
          {
            var cgame = $(this).attr('id').split('-');
            // setGameSelection(cgame[0], cgame[1]);
            getLocationList(cgame[0], cgame[1]);
          });

          navigator.notification.activityStop();
          $.mobile.changePage($('#games_page'));
        }
    })
    .fail(function(jqXHR, textStatus)
    {
        app.report("StatusCode: "+jqXHR.status);
        app.report("Status: "+textStatus);
        app.report("Failed loading the GameList");
        navigator.notification.activityStop();
    });
}

function getLocationList(choosen_game_id, game_name)
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
            navigator.notification.activityStart('LoadLocationList..', 'loading');
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

        storeLocationList(localStorage.getItem('_userID'), placeInstances);

        $('#placesTitle').append(game_name);
        $('#placesText').append(placeInstances["Game"]["description"]);

        var placesListContent = '';
        for(var i = 0; i<placeInstances["Mission"].length; i++)
        {
            placesListContent += '<li id="'+placeInstances["Mission"][i]["id"]+'-'+placeInstances["Mission"][i]["name"]+'"><a href="javaScript:void(0)">'+placeInstances["Mission"][i]["name"]+'</a></li>';
        }
        $('#placesList').append(placesListContent);
        $('#placesList').delegate('li', 'click', function()
        {
          var cplace = $(this).attr('id').split('-');
          app.report(cplace[0]+' '+cplace[1]);
          buildTaskPage(cplace[0]);
        });

        navigator.notification.activityStop();
        $.mobile.changePage($('#places_page'));
    })
    .fail(function(jqXHR, textStatus)
    {
        app.report("StatusCode: "+jqXHR.status);
        app.report("Status: "+textStatus);
        app.report("Failed loading the LocationList");
    });
}

function buildTaskPage(id)
{
  if(window.device.platform == "Android")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", androidLockWorkaround: 1});
  }
  else if(window.device.platform == "iOS")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", location: 1});
  }
  else
  {
    var db =  window.sqlitePlugin.openDatabase({name: "Moles.db"});
  }

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT mission_id, name, description FROM moles_locations WHERE mission_id=?', [id], function(tx, res)
    {
      app.report("Results: "+res.rows.length);
      $('#locationTitle').append(res.rows.item(0).name);
      $('#locationText').append(res.rows.item(0).description);
    });
  });

  var taskListContent = '';
  db.transaction(function(tx)
  {
    tx.executeSql('SELECT task_id, name, description FROM moles_tasks WHERE mission_id=?', [id], function(tx, res)
    {
      app.report("AffectedRows: "+res.rows.length);
      for(var i = 0; i<res.rows.length; i++)
      {
          taskListContent += '<li id="'+res.rows.item(i).task_id+'-'+res.rows.item(i).name+'"><a href="javaScript:void(0)">'+res.rows.item(i).name+'</a></li>';
          // app.report("Task item: "+JSON.stringify(res.rows.item(i)));
      }

      $('#taskList').append(taskListContent);
      $('#taskList').delegate('li', 'click', function()
      {
        var ctask = $(this).attr('id').split('-');
        buildDetailPage(ctask[0]);
      });
      $.mobile.changePage($('#questions_list_page'));
    });
  });
}

function buildDetailPage(id)
{
  if(window.device.platform == "Android")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", androidLockWorkaround: 1});
  }
  else if(window.device.platform == "iOS")
  {
    var db = window.sqlitePlugin.openDatabase({name: "Moles.db", location: 1});
  }
  else
  {
    var db =  window.sqlitePlugin.openDatabase({name: "Moles.db"});
  }

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_tasks WHERE task_id=?', [id], function(tx, res)
    {
      $('#taskTitle').append(res.rows.item(0).name);
      $('#taskText').append(res.rows.item(0).description);

      $.mobile.changePage($('#question_detail'));
    });
  });
}

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
