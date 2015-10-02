function storeAnswer(answerType, answerName, answerValue)
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
}
