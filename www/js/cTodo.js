var app = angular.module('starter.cTodo', ['ngCordova','$actionButton']);
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

  /*Events*/
  $scope.$on('flushDB',function(){
    var query = "DROP TABLE dbTodo";
    $cordovaSQLite.execute(db, query).then(function (res) {
      createTable();
      if(log){
        console.log($scope.todos.length+" Todos deleted");
      }
      $scope.todos.splice(0,$scope.todos.length);
      //$scope.$apply();
    },function (err) {
      console.log(err.message);
    });
  });

  $scope.$on('$ionicView.enter',function () {
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
  });

  /*Scope Methods*/

  $ionicPlatform.ready(function () {
    try {
      db = $cordovaSQLite.openDB({
        name: "todoDb.db",
        location: "default"
      });
      createTable();
      loadTodo();
    }catch(e){
      console.log(e);
    }
  });

  $scope.addTodo = function () {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="todos.todo">',
      title: 'New To Do',
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
              insertTodo($scope.todos.todo);
            }
          }
        }
      ]
    });

    $timeout(function() {
      addPopup.close(); //close the popup after 10 seconds for some reason
    }, 10000);
  };

  $scope.removeTodo = function (index) {
    var query = "DELETE FROM dbTodo WHERE idTodo = " + $scope.todos[index].id;
    $cordovaSQLite.execute(db,query).then(function (res) {
      $scope.todos.splice(index,1);
      for(i = index;i < $scope.todos.length - 1;i++){
        if(log) {
          console.log("Moved from: ");
          console.log($scope.todos[i].posTodo);
        }
        $scope.todos[i].posTodo - 1;
        if(log) {
          console.log("Moved to: ");
          console.log($scope.todos[i].posTodo);
        }
      }
    }, function (err) {
      console.error(err.message);
    });
  };

  $scope.updateTodo = function (index) {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="todos.todo">',
      title: 'Modify To Do',
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
              modifyTodo($scope.todos.todo,index);
            }
          }
        }
      ]
    });

    $timeout(function() {
      addPopup.close(); //close the popup after 10 seconds for some reason
    }, 10000);
  };

  $scope.moveTodo = function (fromIndex, toIndex) {
    var item = $scope.todos[fromIndex];

    modifyTodo($scope.todos[fromIndex].name,toIndex);

    $scope.todos.splice(fromIndex, 1);
    $scope.todos.splice(toIndex, 0, item);
  };

  /*Local Methods*/

  function createTable () {
    var query = "CREATE TABLE IF NOT EXISTS dbTodo (idTodo INTEGER PRIMARY KEY ASC AUTOINCREMENT, posTodo INTEGER, todo TEXT)";
    $cordovaSQLite.execute(db, query);
  };

  function loadTodo () {
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
            console.log($scope.todos[i].name);
          }
        }
      }
    }, function (error) {
      console.log(error.message);
    });
  };

  function insertTodo (todo) {
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
        console.log($scope.todos[$scope.todos.length - 1].name);
      }
    }, function (err) {
      console.error(err.message);
    });
  };

  function modifyTodo(todo,index) {
    var query = "UPDATE dbTodo SET todo = '" +todo+ "',posTodo = '" +index+ "' WHERE idTodo = " +$scope.todos[index].id;
    $cordovaSQLite.execute(db,query).then(function (res) {
      if(log) {
        console.log("Updated from: ");
        console.log($scope.todos[index].name);
      }
      $scope.todos[index].name = todo;
      $scope.todos[index].posTodo = index;
      if(log) {
        console.log("Updated to: ");
        console.log($scope.todos[index].name);
      }
    }, function (err) {
      console.error(err.message);
    });
  };
});
