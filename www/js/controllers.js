var app = angular.module('starter.controllers', ['ngCordova','$actionButton']);
var db = null;
var log = true;

app.controller('mainCtrl',function ($scope,$ionicPopup,$timeout,$cordovaSQLite,$ionicPlatform,$actionButton) {

  /*Variables*/

  $scope.editTodo = {
    "showEdit" : false
  };

  $scope.todos = [
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

  var actionButton = $actionButton.create({
    mainAction: {
      icon: 'ion-plus-round',
      backgroundColor: '#9E9E9E',
      textColor: 'white',
      onClick: function () {
        $scope.addTodo();
      }
    }
  });

  /*Methods*/

  $ionicPlatform.ready(function () {
    try {
      db = $cordovaSQLite.openDB({
        name: "todoDb.db",
        location: "default"
      });
      $scope.createTable();
      $scope.loadTodo();
    }catch(e){
      console.log(e);
    }
  });

  $scope.createTable = function () {
    var query = "CREATE TABLE IF NOT EXISTS dbTodo (idTodo INTEGER PRIMARY KEY ASC AUTOINCREMENT, posTodo INTEGER, todo TEXT)";
    $cordovaSQLite.execute(db, query);
  };

  $scope.loadTodo = function () {
    var query = "SELECT * FROM dbTodo ORDER BY posTodo";
    $cordovaSQLite.execute(db, query).then(function (res) {
      if (res.rows.length > 0) {
        for(var i = 0;i < res.rows.length;i++) {
          $scope.todos.push({
            "id":res.rows.item(i).idTodo,
            "posTodo":res.rows.item(i).posTodo,
            "name":res.rows.item(i).todo
          });
          if(log){
            console.log("Loaded: ");
            console.log($scope.todos[i]);
          }
        }
      }
    }, function (error) {
      console.log(error);
    });
  };

  $scope.addTodo = function () {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="todos.todo">',
      title: 'Enter To Do',
      subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.todos.todo) {
              //don't allow the user to close unless he enters something
              e.preventDefault();
            } else {
              $scope.insertTodo($scope.todos.todo);
            }
          }
        }
      ]
    });

    $timeout(function() {
      addPopup.close(); //close the popup after 10 seconds for some reason
    }, 10000);
  };

  $scope.insertTodo = function (todo) {
    var posTodo = $scope.todos.length;
    var query = "INSERT INTO dbTodo (todo,posTodo) VALUES (?,?)";
    $cordovaSQLite.execute(db,query,[todo]).then(function (res) {
      $scope.todos.push({
        "id":res.insertId,
        "posTodo":posTodo,
        "name":todo
      });
      if(log) {
        console.log("Inserted: ");
        console.log($scope.todos[$scope.todos.length - 1]);
      }
    }, function (err) {
      console.error(err);
    });
  };

  $scope.removeTodo = function (index) {
    var query = "DELETE FROM dbTodo WHERE idTodo = " + $scope.todos[index].id;
    $cordovaSQLite.execute(db,query).then(function (res) {
      $scope.todos.splice(index,1);
      for(i = index;i < $scope.todos.length - 1;i++){
        if(log) {
          console.log("Moved from: ");
          console.log($scope.todos[i]);
        }
        $scope.todos[i].posTodo - 1;
        if(log) {
          console.log("Moved to: ");
          console.log($scope.todos[i]);
        }
      }
    }, function (err) {
      console.error(err);
    });
  };

  $scope.updateTodo = function (index) {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="todos.todo">',
      title: 'Enter To Do',
      subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.todos.todo) {
              //don't allow the user to close unless he enters something
              e.preventDefault();
            } else {
              $scope.modifyTodo($scope.todos.todo,index);
            }
          }
        }
      ]
    });

    $timeout(function() {
      addPopup.close(); //close the popup after 10 seconds for some reason
    }, 10000);
  };

  $scope.modifyTodo = function (todo,index) {
    var query = "UPDATE dbTodo SET todo = '" +todo+ "',posTodo = '" +index+ "' WHERE idTodo = " +$scope.todos[index].id;
    $cordovaSQLite.execute(db,query).then(function (res) {
      if(log) {
        console.log("Updated from: ");
        console.log($scope.todos[index]);
      }
      $scope.todos[index].name = todo;
      $scope.todos[index].posTodo = index;
      if(log) {
        console.log("Updated to: ");
        console.log($scope.todos[index]);
      }
    }, function (err) {
      console.error(err);
    });
  };

  $scope.moveTodo = function (fromIndex, toIndex) {
    var item = $scope.todos[fromIndex];

    $scope.modifyTodo($scope.todos[fromIndex].name,toIndex);

    $scope.todos.splice(fromIndex, 1);
    $scope.todos.splice(toIndex, 0, item);
  };

  $scope.flushDB = function () {
    var query = "DROP TABLE dbTodo";
    $cordovaSQLite.execute(db, query).then(function (res) {
      for(i=0;i<$scope.todos.length;i++){
        $scope.todos.splice(i,1);
      }
      $scope.createTable();
    },function (err) {
      console.log(err);
    });
  };
});
