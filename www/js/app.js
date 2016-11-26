// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic','ngCordova']);
var db = null;

app.run(function($ionicPlatform,$cordovaSQLite) {
  $ionicPlatform.ready(function($scope) {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    console.log("deviceReady");
  });
});

app.controller('mainCtrl',function ($scope,$ionicPopup,$timeout,$cordovaSQLite,$ionicPlatform) {
  $scope.delTodo = {
    "showDel" : false
  };

  $scope.todos = [
    /*{
      "id":"1",
      "name":"todo1"
    },
    {
      "id":"2",
      "name":"todo2"
    }*/
  ];

  $ionicPlatform.ready(function () {
    try {
      db = $cordovaSQLite.openDB({
        name: "todoDb.db",
        location: "default"
      });
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS dbTodo (idTodo INTEGER PRIMARY KEY ASC AUTOINCREMENT, todo TEXT)");
      $scope.loadTodo();
    }catch(e){
      console.log(e);
    }
  });

  $scope.loadTodo = function () {
    var query = "SELECT * FROM dbTodo";
    $cordovaSQLite.execute(db, query).then(function (res) {
      if (res.rows.length > 0) {
        for(var i = 0;i < res.rows.length;i++) {
          $scope.todos.push({
            "id":res.rows.item(i).idTodo,
            "name":res.rows.item(i).todo
          });
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
    var query = "INSERT INTO dbTodo (todo) VALUES (?)";
    $cordovaSQLite.execute(db,query,[todo]).then(function (res) {
      $scope.todos.push({
        "id":res.insertId,
        "name":todo
      });
    }, function (err) {
      console.error(err);
    });
  };

  $scope.removeTodo = function (index) {
    var query = "DELETE FROM dbTodo WHERE idTodo = " + $scope.todos[index].id;
    $cordovaSQLite.execute(db,query).then(function (res) {
      $scope.todos.splice(index,1);
    }, function (err) {
      console.error(err);
    });
  };

  $scope.updateTodo = function (index) {
    console.log("updateTodo: "+index);
  };
});
