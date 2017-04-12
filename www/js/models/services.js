var app = angular.module('starter.services',[]);
var db = null;
var log = true;
var todoObj = [
  /*{
   "id":"1",
   "posTodo":"0",
   "name":"todo1"
   },
   {
   "id":"2",
   "posTodo":"1",
   "name":"todo2"
   },
   {
   "id":"3",
   "posTodo":"2",
   "name":"todo3"
   }*/
];
var listaObj = [
  /*{
   "id":"1",
   "name":"lista1"
   },
   {
   "id":"2",
   "name":"lista2"
   },
   {
   "id":"3",
   "name":"lista3"
   }*/
];

app.service('initDbService',function ($cordovaSQLite) {
  return{
    createTableService : function () {
      try {
        db = $cordovaSQLite.openDB({
          name: "todoDb.db",
          location: "default"
        });
        var query = "CREATE TABLE IF NOT EXISTS dbTodo (idTodo INTEGER PRIMARY KEY ASC AUTOINCREMENT, posTodo INTEGER, todo TEXT, idLista INTEGER)";
        $cordovaSQLite.execute(db, query).then(function (res) {
          if (log){
            console.log("Table dbTodo created");
          }
        },function (error) {
          console.error(error.message);
        });

        var query = "CREATE TABLE IF NOT EXISTS dbLista (idLista INTEGER PRIMARY KEY ASC AUTOINCREMENT, lista TEXT)";
        $cordovaSQLite.execute(db, query).then(function (res) {
          if(log){
            console.log("Table dbLista created");
          }
        },function (error) {
          console.log(error.message);
        });
      }catch(e){console.error(e);}
    }
  }
});

app.factory('databaseFactory',function ($cordovaSQLite, initDbService) {
  return{
    loadTodoService : function (iLista) {
      todoObj.splice(0, todoObj.length);
      var query = "SELECT * FROM dbTodo WHERE idLista = '"+iLista+"' ORDER BY posTodo";

      $cordovaSQLite.execute(db, query).then(function (res) {
        if (log) {
          console.log("Loaded: " + res.rows.length + " todos");
        }
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            todoObj.push({
              "id": res.rows.item(i).idTodo,
              "posTodo": res.rows.item(i).posTodo,
              "name": res.rows.item(i).todo
            });
            if (log) {
              console.log("Todo " + todoObj[i].posTodo + " " + todoObj[i].name+" Lista "+res.rows.item(i).idLista);
            }
          }
        }
      }, function (error) {
        console.error(error.message);
      });

      return todoObj;
    },

    insertTodoService : function (newTodo,iLista) {
      var posTodo = todoObj.length;
      var query = "INSERT INTO dbTodo (todo,posTodo,idLista) VALUES (?,?,?)";
      $cordovaSQLite.execute(db,query,[newTodo,posTodo,iLista]).then(function (res) {
        todoObj.push({
          "id":res.insertId,
          "posTodo":posTodo,
          "name":newTodo
        });
        if(log) {
          console.log("Inserted: "+todoObj[todoObj.length - 1].name+" Lista: "+iLista);
        }
      }, function (err) {
        console.error(err.message);
      });
      return todoObj;
    },

    modifyTodoService : function (nameTodo,iTodo,jTodo) {
      var item = todoObj[iTodo];
      //Query que realiza movimiento en caso de ordenamiento negativo
      var query1 = "UPDATE dbTodo SET posTodo = posTodo + 1 WHERE posTodo >= "+jTodo+" AND posTodo < "+iTodo;
      //Query que realiza movimiento en caso de ordenamiento positivo
      var query2 = "UPDATE dbTodo SET posTodo = posTodo - 1 WHERE posTodo <= "+jTodo+" AND posTodo > "+iTodo;
      //Query que actualiza el item
      var query3 = "UPDATE dbTodo SET todo = '" +nameTodo+ "',posTodo = '" +jTodo+ "' WHERE idTodo = " +todoObj[iTodo].id;

      if(iTodo>jTodo){
        $cordovaSQLite.execute(db,query1).then(function (res) {},function (err) {
          console.error(err.message);
        });
      }else if(iTodo < jTodo){
        $cordovaSQLite.execute(db,query2).then(function (res) {},function (err) {
          console.error(err.message);
        });
      }

      $cordovaSQLite.execute(db,query3).then(function (res) {
        todoObj[iTodo].name = nameTodo;
        todoObj[iTodo].posTodo = iTodo;
        if(iTodo != jTodo){
          todoObj.splice(iTodo, 1);
          todoObj.splice(jTodo, 0, item);
        }
        if (log){
          console.log("Updated: "+todoObj[jTodo].name+" Pos: "+jTodo)
        }
      }, function (err) {
        console.error(err);
      });
      return todoObj;
    },

    deleteTodoService : function (iTodo) {
      var query = "DELETE FROM dbTodo WHERE idTodo = " + todoObj[iTodo].id;
      $cordovaSQLite.execute(db,query).then(function (res) {
        todoObj.splice(iTodo,1);
        for(i = iTodo;i < todoObj.length - 1;i++){
          if(log) {
            console.log("Moved from: "+todoObj[i].posTodo);
          }
          todoObj[i].posTodo - 1;
          if(log) {
            console.log("Moved to: "+todoObj[i].posTodo);
          }
        }
      }, function (err) {
        console.error(err.message);
      });
      return todoObj;
    },

    flushDbService: function () {
      var query = "DROP TABLE dbTodo";
      $cordovaSQLite.execute(db, query).then(function (res) {
        if (log) {
          console.log(todoObj.length + " Todos deleted");
        }
        todoObj.splice(0, todoObj.length);
        var query = "DROP TABLE dbLista";
        $cordovaSQLite.execute(db, query).then(function (res) {
          if (log) {
            console.log(listaObj.length + " Lists deleted");
          }
          listaObj.splice(0, listaObj.length);
          initDbService.createTableService();
        },function (err) {
          console.error(err.message);
        });
      },function (err) {
        console.error(err.message);
      });
    },

    loadListaService : function () {
      if(listaObj.length == 0) {
        var query = "SELECT * FROM dbLista ORDER BY lista";
        $cordovaSQLite.execute(db, query).then(function (res) {
          if (log) {
            console.log("Loaded: " + res.rows.length + " lists");
          }
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
              listaObj.push({
                "id": res.rows.item(i).idLista,
                "name": res.rows.item(i).lista
              });
              if (log) {
                console.log("List " + listaObj[i].id + " - " +listaObj[i].name);
              }
            }
          }
        }, function (error) {
          console.error(error.message);
        });
      }
      return listaObj;
    },

    insertListaService : function (newLista) {
      var query = "INSERT INTO dbLista (lista) VALUES (?)";
      $cordovaSQLite.execute(db,query,[newLista]).then(function (res) {
        listaObj.push({
          "id":res.insertId,
          "name":newLista
        });
        if(log) {
          console.log("Inserted: "+listaObj[listaObj.length - 1].name);
        }
      }, function (err) {
        console.error(err.message);
      });
      return listaObj;
    },
  }
});
