var app = angular.module('starter.services',[]);
var db = null;
var log = false;
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
   "posLista":"0",
   "name":"lista1"
   },
   {
   "id":"2",
   "posLista":"1",
   "name":"lista2"
   },
   {
   "id":"3",
   "posLista":"2",
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
        var query = "CREATE TABLE IF NOT EXISTS dbTodo (idTodo INTEGER PRIMARY KEY ASC AUTOINCREMENT, posTodo INTEGER, todo TEXT, posLista INTEGER)";
        $cordovaSQLite.execute(db, query).then(function (res) {
          if (log){
            console.log("Table dbTodo created");
          }
        },function (error) {
          console.error(error.message);
        });

        var query = "CREATE TABLE IF NOT EXISTS dbLista (idLista INTEGER PRIMARY KEY ASC AUTOINCREMENT, posLista INTEGER, lista TEXT)";
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
    loadTodoService : function (posLista) {
      todoObj.splice(0, todoObj.length);
      var query = "SELECT * FROM dbTodo WHERE posLista = '"+posLista+"' ORDER BY posTodo";

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
              console.log("ID " + todoObj[i].id + " POS " + todoObj[i].posTodo+" NAME "+todoObj[i].name+" LIST "+res.rows.item(i).posLista);
            }
          }
        }
      }, function (error) {
        console.error(error.message);
      });

      return todoObj;
    },

    insertTodoService : function (newTodo,posLista) {
      var posTodo = todoObj.length;
      var query = "INSERT INTO dbTodo (todo,posTodo,posLista) VALUES (?,?,?)";
      $cordovaSQLite.execute(db,query,[newTodo,posTodo,posLista]).then(function (res) {
        todoObj.push({
          "id":res.insertId,
          "posTodo":posTodo,
          "name":newTodo
        });
        if(log) {
          console.log("Inserted: "+todoObj[todoObj.length - 1].name+" Lista: "+posLista);
        }
      }, function (err) {
        console.error(err.message);
      });
      return todoObj;
    },

    modifyTodoService : function (nameTodo,iTodo,jTodo,posLista) {
      var item = todoObj[iTodo];
      //Query que realiza movimiento en caso de ordenamiento negativo
      var query1 = "UPDATE dbTodo SET posTodo = posTodo + 1 WHERE posTodo >= "+jTodo+" AND posTodo < "+iTodo+" AND posLista = "+posLista;
      //Query que realiza movimiento en caso de ordenamiento positivo
      var query2 = "UPDATE dbTodo SET posTodo = posTodo - 1 WHERE posTodo <= "+jTodo+" AND posTodo > "+iTodo+" AND posLista = "+posLista;
      //Query que actualiza el item
      var query3 = "UPDATE dbTodo SET todo = '" +nameTodo+ "',posTodo = '" +jTodo+ "' WHERE idTodo = " +todoObj[iTodo].id+" AND posLista = "+posLista;

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
          console.log("Updated: "+todoObj[jTodo].name+" Pos: "+jTodo+" Lista: "+posLista);
        }
      }, function (err) {
        console.error(err);
      });
      return todoObj;
    },

    deleteTodoService : function (iTodo,posLista) {
      var query = "DELETE FROM dbTodo WHERE idTodo = " + todoObj[iTodo].id+" AND posLista = "+posLista;
      var query2 = 'UPDATE dbTodo SET posTodo = posTodo - 1 WHERE posTodo > '+iTodo;

      $cordovaSQLite.execute(db,query).then(function (res) {
        $cordovaSQLite.execute(db,query2);
        for(i = iTodo+1;i < todoObj.length;i++){
          if(log) {
            console.log("Moved from: "+todoObj[i].posTodo+" Lista: "+posLista);
          }
          todoObj[i].posTodo = todoObj[i].posTodo - 1;
          if(log) {
            console.log("Moved to: "+todoObj[i].posTodo+" Lista: "+posLista);
          }
        }
        todoObj.splice(iTodo,1);
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
        var query = "SELECT * FROM dbLista ORDER BY posLista";
        $cordovaSQLite.execute(db, query).then(function (res) {
          if (log) {
            console.log("Loaded: " + res.rows.length + " lists");
          }
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
              listaObj.push({
                "id": res.rows.item(i).idLista,
                "posLista":res.rows.item(i).posLista,
                "name": res.rows.item(i).lista
              });
              if (log) {
                console.log("List " + listaObj[i].posLista + " - " +listaObj[i].name);
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
      var posLista = listaObj.length;
      var query = "INSERT INTO dbLista (posLista, lista) VALUES (?,?)";
      $cordovaSQLite.execute(db,query,[posLista,newLista]).then(function (res) {
        listaObj.push({
          "id":res.insertId,
          "posLista":posLista,
          "name":newLista
        });
        if(log) {
          console.log("Inserted: "+listaObj[listaObj.length - 1].name+" Pos: "+posLista);
        }
      }, function (err) {
        console.error(err.message);
      });
      return listaObj;
    },

    deleteListaService : function (iLista) {
      //List's Scripts
      var query1 = "DELETE FROM dbLista WHERE idLista = " + listaObj[iLista].id;
      var query2 = 'UPDATE dbLista SET posLista = posLista - 1 WHERE posLista > '+iLista;
      //Element's Scripts
      var query3 = 'DELETE FROM dbTodo WHERE posLista = '+iLista;
      var query4 = 'UPDATE dbTodo SET posLista = posLista - 1 WHERE posLista >'+iLista;

      $cordovaSQLite.execute(db,query1).then(function (res) {
        $cordovaSQLite.execute(db,query2);
        $cordovaSQLite.execute(db,query3);
        $cordovaSQLite.execute(db,query4);
        for(i = iLista+1;i < listaObj.length;i++){
          if(log) {
            console.log("Moved from: "+listaObj[i].posLista);
          }
          listaObj[i].posLista = listaObj[i].posLista - 1;
          if(log) {
            console.log("Moved to: "+listaObj[i].posLista);
          }
        }
        listaObj.splice(iLista,1);
      }, function (err) {
        console.error(err.message);
      });
      return listaObj;
    },

    modifyListaService : function (nameLista,iLista) {
      //Query que actualiza el item
      var query1 = "UPDATE dbLista SET lista = '" +nameLista+ "' WHERE idLista = " +listaObj[iLista].id;

      $cordovaSQLite.execute(db,query1).then(function (res) {
        listaObj[iLista].name = nameLista;
        if (log){
          console.log("Updated: "+listaObj[iLista].name);
        }
      }, function (err) {
        console.error(err);
      });
      return listaObj;
    },

    listLabelService : function (iLista) {
      return listaObj[iLista].name;
    }
  }
});
