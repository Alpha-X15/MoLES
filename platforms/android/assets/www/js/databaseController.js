function openDatabase()
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

  return db;
}

function setUpDatabase()
{
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('DROP TABLE IF EXISTS moles_users');
    tx.executeSql('DROP TABLE IF EXISTS moles_games');
    tx.executeSql('DROP TABLE IF EXISTS moles_locations');
    tx.executeSql('DROP TABLE IF EXISTS moles_tasks');
    tx.executeSql('DROP TABLE IF EXISTS moles_images');
    tx.executeSql('DROP TABLE IF EXISTS moles_answers');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_users (id integer primary key, moles_uid integer, username text, authToken text, validUser text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_games (id integer primary key, moles_uid integer, game_inst_id integer, game_id integer, group_id integer, game_name text, game_description text, has_data integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_locations (id integer primary key, moles_uid integer, mission_id integer, game_id integer, name text, description text, location text, lat real, lng real)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_tasks (id integer primary key, moles_uid integer, task_id integer, mission_id integer, name text, description text, location text, lat real, lng real)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_images (id integer primary key, moles_uid integer, image_id integer, task_id integer, mission_id integer, game_id integer, image_title text, filename text, imagepath text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS moles_answers (id integer primary key, moles_uid integer, task_id integer, answer_type text, answer_name text, answer_value text, uploaded integer)');
  });
}

function storeUserLogin(userid, username, authToken, validUser)
{
  app.report("store userlogin");
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_users WHERE moles_uid=?', [userid], function(tx, res)
    {
      if(res.rows.length == 0)
      {
        tx.executeSql('INSERT INTO moles_users (moles_uid, username, authToken, validUser) VALUES (?,?,?,?)', [userid, username, authToken, validUser], function(tx, res) {
          app.report("InsertedId: "+res.insertId);
          app.report("AffectedRows: "+res.rowsAffected);
        });
      }
      else
      {
        tx.executeSql('UPDATE moles_users SET username=?, authToken=?, validUser=? WHERE moles_uid=?', [username, authToken, validUser, userid], function(tx, res)
        {
          app.report('USER Update '+res.rowsAffected);
        });
      }
    });
  });

  // db.transaction(function(tx)
  // {
  //   tx.executeSql('INSERT INTO moles_users (moles_uid, username, authToken, validUser) VALUES (?,?,?,?)', [userid, username, authToken, validUser], function(tx, res) {
  //     app.report("InsertedId: "+res.insertId);
  //     app.report("AffectedRows: "+res.rowsAffected);
  //   });
  // });

  db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM moles_users", [], function(tx, res) {
        app.report("res.rows.length: " + res.rows.length);
        app.report("res.rows.item(0): " + JSON.stringify(res.rows.item(0)));
        app.report("res.rows: "+JSON.stringify(res.rows));
      });
    });
}

// function storeGameList(user, gameList)
// {
//   var db = openDatabase();
//
//   db.transaction(function(tx)
//   {
//     for(var i = 0; i<gameList.length; i++)
//     {
//       tx.executeSql('INSERT INTO moles_games (moles_uid, game_inst_id, game_id, group_id, game_name, game_description, has_data) VALUES (?,?,?,?,?,?,?)',
//       [
//         user,
//         gameList[i]["GameInstance"]["id"],
//         gameList[i]["GameInstance"]["game_id"],
//         gameList[i]["GameInstance"]["group_id"],
//         gameList[i]["GameInstance"]["name"],
//         gameList[i]["Game"]["description"],
//         0
//       ], function(tx, res)
//       {
//         app.report("InsertedGameId: "+res.insertId);
//       });
//     }
//   });
// }

function storeGame(user, gameObj)
{
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('INSERT INTO moles_games (moles_uid, game_inst_id, game_id, group_id, game_name, game_description, has_data) VALUES (?,?,?,?,?,?,?)',
    [
      user,
      gameObj.GameInstance.id,
      gameObj.GameInstance.game_id,
      gameObj.GameInstance.group_id,
      gameObj.Game.name,
      gameObj.Game.description,
      1
    ], function(tx, res)
    {
      app.report("InsertedGameId: "+res.insertId);
    });
  });
}

function storeLocationList(user, locationList)
{
  var db = openDatabase();

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
  var mediaImages = [];
  if($.isEmptyObject(locationList["Media"]) == false)
  {
      for(var image in locationList["Media"])
      {
        mediaImages.push(locationList["Media"][image]);
      }
  }

  for(var mission in locationList["Mission"])
  {
    if($.isEmptyObject(locationList["Mission"][mission]["Media"]) == false)
    {
      for(var missionimage in locationList["Mission"][mission]["Media"])
      {
        mediaImages.push(locationList["Mission"][mission]["Media"][missionimage]);
      }
    }

    for(var question in locationList["Mission"][mission]["Question"])
    {
      questions.push(locationList["Mission"][mission]["Question"][question]);
      if($.isEmptyObject(locationList["Mission"][mission]["Question"][question]["Media"]) == false)
      {
        for(var image in locationList["Mission"][mission]["Question"][question]["Media"])
        {
          mediaImages.push(locationList["Mission"][mission]["Question"][question]["Media"][image]);
        }
      }
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

  // db.transaction(function(tx)
  // {
  //   tx.executeSql('UPDATE moles_games SET has_data=1 WHERE game_id=?',[locationList["Mission"][0]["game_id"]], function(tx, res)
  //   {
  //     app.report("Updated games "+res.rowsAffected);
  //   });
  // });

  getRESTImages(mediaImages);
}

function storeImages(userid, imageList)
{
  var db = openDatabase();

  db.transaction(function(tx){
    for(var media in imageList)
    {
        tx.executeSql('INSERT INTO moles_images (moles_uid, image_id, task_id, mission_id, game_id, image_title, filename, imagepath) VALUES (?,?,?,?,?,?,?,?)',
        [
          userid,
          imageList[media]["id"],
          imageList[media]["question_id"],
          imageList[media]["mission_id"],
          imageList[media]["game_id"],
          imageList[media]["title"],
          imageList[media]["file"],
          imageList[media]["filepath"]
        ],
        function(tx, res)
        {
          app.report("Inserted Image "+res.insertId);
        });
    }
  });

  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM moles_images", [], function(tx, res){
      app.report("Images length "+res.rows.length);
      app.report("image 0: " + JSON.stringify(res.rows.item(0)));
      app.report(JSON.stringify(res.rows));
    });
  });
}

function storeAnswer(answerType, answerName, answerValue)
{
  var db = openDatabase();

  var taskId = localStorage.getItem('_choosenTaskId');
  var userId = localStorage.getItem('_userID');

  db.transaction(function(tx)
  {
    tx.executeSql('INSERT INTO moles_answers (moles_uid, task_id, answer_type, answer_name, answer_value, uploaded) VALUES (?,?,?,?,?,?)', [userId, taskId, answerType, answerName, answerValue, 0], function(tx, res)
    {
      app.report("Inserted answer"+res.insertId);
    });
  });

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_answers',[], function(tx, res)
    {
      app.report("Moles_answers "+JSON.stringify(res.rows, null, 4));
      app.report("Answer 0 "+JSON.stringify(res.rows.item(0), null, 4));
    });
  });

  if(answerType == "Text")
  {
      $.mobile.changePage($('#question_detail'));
  }
}

function getAnswersForUpload()
{
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_answers WHERE uploaded=?',[0], function(tx, res)
    {
      if(res.rows.length > 0)
      {
        localStorage.setItem('_uploadQueue', res.rows.length);
        $.mobile.loading('show',
        {
          text: "Dateiupload läuft für "+res.rows.length+" Antworten. Bitte habe einen Moment Geduld",
          textVisible: true,
          theme: 'a',
          html: ""
        });
      }

      for(var i = 0; i<res.rows.length; i++)
      {
          prepareAnswerUpload(res.rows.item(i));
          // app.report(JSON.stringify(res.rows.item(i), null, 4));
      }
    });
  });
}

function getAnswersUploadCount()
{
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT COUNT(*) AS anumber FROM moles_answers WHERE uploaded=?', [0], function(tx, res)
    {
      app.report(JSON.stringify(res.rows.item(0), null, 4));
      $('#uploadText').empty();
      var uploadTextContent = '';
      if(res.rows.item(0).anumber == 1)
      {
        uploadTextContent = 'Es steht '+res.rows.item(0).anumber+' Antwort zum Hochladen zur Verfügung. WLAN Empfang ist für den Upload zu empfehlen.';
      }
      else
      {
        uploadTextContent = 'Es stehen '+res.rows.item(0).anumber+' Antworten zum Hochladen zur Verfügung. WLAN Empfang ist für den Upload zu empfehlen.';
      }

      $('#uploadText').append(uploadTextContent);
      if(res.rows.item(0).anumber > 0)
      {
        $.mobile.changePage($('#upload_page'));
      }
      else
      {
        alert("Es sind keine Antworten für den Upload vorhanden.");
      }
    });
  });
}

function offlineLogin(username, authToken)
{
    var db = openDatabase();

    db.transaction(function(tx)
    {
      tx.executeSql('SELECT * FROM moles_users WHERE username=?', [username], function(tx, res)
      {
        if(res.rows.length == 0)
        {
          alert('Der Login ist Fehlgeschlagen. Überprüfe bitte deinen Usernamen und dein Passwort. Handelt es sich um deinen aller ersten Login, solltest eine sichere und schnelle Internetverbindung haben um deine Daten zu referenzieren und Spiele zu downloaden.');
        }
        else if(res.rows.length == 1)
        {
            if(username == res.rows.item(0).username && authToken == res.rows.item(0).authToken && res.rows.item(0).validUser == "true")
            {
              app.report('hier und so');
              buildOfflineGamesPage(res.rows.item(0).moles_uid);
            }
            else
            {
              alert('Der Login ist Fehlgeschlagen. Überprüfe bitte deinen Usernamen und dein Passwort. Handelt es sich um deinen aller ersten Login, solltest eine sichere und schnelle Internetverbindung haben um deine Daten zu referenzieren und Spiele zu downloaden.');
            }
        }
      });
    });
}

function buildOfflineGamesPage(userid)
{
  var db = openDatabase();

  var gamesListContent = '';
  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_games WHERE moles_uid=?', [userid], function(tx, res)
    {
      app.report(res.rows.length);
      $('#gameList').empty();
      for(var i = 0; i<res.rows.length; i++)
      {
          gamesListContent += '<li id="'+res.rows.item(i).game_inst_id+'-'+res.rows.item(i).game_id+'-'+res.rows.item(i).game_name+'"><a href="javaScript:void(0)">'+res.rows.item(i).game_name+'</a></li>';
      }
      app.report(gamesListContent);
      $('#gameList').append(gamesListContent);

      $('#gameList').off('click', 'li');

      $('#gameList').on('click', 'li', function()
      {
        var cgame = $(this).attr('id').split('-');
        localStorage.setItem('_choosendGameID', cgame[1]);
        localStorage.setItem('_ActiveInstanceID', cgame[0]);
        buildOfflineLocationPage(cgame[1], cgame[2]);
      });
      $.mobile.changePage($('#games_page'));
    });
  });
}

function buildOfflineLocationPage(game_id, game_name)
{
  var db = openDatabase();

  $('#placesTitle').empty();
  $('#placesText').empty();
  $('#placesTitle').append(game_name);

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT game_description FROM moles_games WHERE game_id=?', [game_id], function(tx, res)
    {
      $('#placesText').append(res.rows.item(0).game_description);
    });
  });

  $('#placesList').empty();
  var placesListContent = '';
  db.transaction(function(tx)
  {
      tx.executeSql('SELECT * FROM moles_locations WHERE game_id=?', [game_id], function(tx, res)
      {
        app.report(res.rows.length);

        for(var i = 0; i<res.rows.length; i++)
        {
            placesListContent += '<li id="'+res.rows.item(i).mission_id+'-'+res.rows.item(i).name+'"><a href="javaScript:void(0)">'+res.rows.item(0).name+'</a></li>';
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

        $.mobile.changePage($('#places_page'));
      });
  });
}

function buildTaskPage(id)
{
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT mission_id, name, description FROM moles_locations WHERE mission_id=?', [id], function(tx, res)
    {
      // app.report("Results: "+res.rows.length);
      // app.report("Result 0: "+JSON.stringify(res.rows.item(0), null, 4));
      $('#locationTitle').empty();
      $('#locationText').empty();
      $('#locationTitle').append(res.rows.item(0).name);
      $('#locationText').append(res.rows.item(0).description);

    });
  });

  db.transaction(function(tx) {
    tx.executeSql("SELECT imagepath FROM moles_images WHERE mission_id=?", [id], function(tx, res)
    {
      $('#locationImage').attr("src", res.rows.item(0).imagepath);
    });
  });

  var taskListContent = '';
  db.transaction(function(tx)
  {
    tx.executeSql('SELECT task_id, name, description FROM moles_tasks WHERE mission_id=?', [id], function(tx, res)
    {
      app.report("AffectedRows: "+res.rows.length);
      $('#taskList').empty();
      for(var i = 0; i<res.rows.length; i++)
      {
          taskListContent += '<li id="'+res.rows.item(i).task_id+'-'+res.rows.item(i).name+'"><a href="javaScript:void(0)">'+res.rows.item(i).name+'</a></li>';
      }

      $('#taskList').append(taskListContent);

      $('#taskList').off('click', 'li');

      // $('#taskList').delegate('li', 'click', function()
      $('#taskList').on('click', 'li', function()
      {
        var ctask = $(this).attr('id').split('-');
        buildDetailPage(ctask[0]);
        localStorage.setItem('_choosenTaskId', ctask[0]);
      });
      $.mobile.changePage($('#questions_list_page'));
    });
  });
}

function buildDetailPage(id)
{
  var db = openDatabase();
  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_tasks WHERE task_id=?', [id], function(tx, res)
    {
      // app.report("Results: "+res.rows.length);
      // app.report("Result 0: "+JSON.stringify(res.rows.item(0), null, 4));
      $('#taskTitle').empty();
      $('#taskText').empty();
      $('#taskTitle').append(res.rows.item(0).name);
      $('#taskText').append(res.rows.item(0).description);
    });
  });

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT imagepath FROM moles_images WHERE task_id=?', [id], function(tx, res)
    {
      $('#taskImage').attr("src", "");
      if(res.rows.length > 0)
      {
        $('#taskImage').attr("src", res.rows.item(0).imagepath);
        $.mobile.changePage($('#question_detail'));
      }
      else
      {
        $.mobile.changePage($('#question_detail'));
      }

    });
  });
}

function buildAnswersPage()
{
  var task_id = localStorage.getItem('_choosenTaskId');
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_answers WHERE task_id=?', [task_id], function(tx, res)
    {
      app.report(JSON.stringify(res.rows.item(0), null, 4));
      if(res.rows.length > 0)
      {
        var answersContent = '<ul data-role="listview">';
        for(var i = 0; i<res.rows.length; i++)
        {
          if(res.rows.item(i).answer_type == "Text")
          {
            answersContent += '<li><img src="img/icon_pencil43.png"/></li>';
          }
          else if (res.rows.item(i).answer_type == "Picture")
          {
            answersContent += '<li><img src="'+res.rows.item(i).answer_value+'"/></li>';
          }
          else if (res.rows.item(i).answer_type == 'Video')
          {
            answersContent += '<li><video controls><source src="'+res.rows.item(0).answers_value+'"></video></li>';
          }
          else if (res.rows.item(i).answer_type == 'Audio')
          {
            answersContent += '<li><img src="img/icon_microphone9.png" /></li>';
          }
        }
        answersContent += '</ul>';
        $('#answersContainer').append(answersContent);

      }
      $.mobile.changePage($('#answers_page'));
    });
  });
}

function updateAnswersList(internalID)
{
  var db = openDatabase();

  db.transaction(function(tx)
  {
    tx.executeSql('UPDATE moles_answers SET uploaded=1 WHERE id=?', [internalID], function(tx, res)
    {
      app.report("Update affected "+res.rowsAffected);
    });
  });

  db.transaction(function(tx)
  {
    tx.executeSql('SELECT * FROM moles_answers WHERE uploaded=1', [], function(tx, res)
    {
      app.report("Uploaded answers "+res.rows.length);
    });
  });
}
