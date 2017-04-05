var app = angular.module('starter.cTodo', ['ngCordova','$actionButton']);

app.controller('mainCtrl',function ($scope, $ionicPopup, $timeout, $cordovaSQLite, $actionButton, databaseFactory, $ionicPlatform, initDbService) {

  /*Variables*/
  $scope.editTodo = {
    "showEdit" : false
  };

  $scope.todos = [];

  /*Events*/
  $ionicPlatform.ready(function () {
    initDbService.createTableService();
    $scope.todos = databaseFactory.loadTodoService();
  })

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
              $scope.todos = databaseFactory.insertTodoService($scope.todos.todo);
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
    $scope.todos = databaseFactory.deleteTodoService(index);
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
              $scope.todos = databaseFactory.modifyTodoService($scope.todos.todo,index,index);
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
    $scope.todos = databaseFactory.modifyTodoService($scope.todos[fromIndex].name,fromIndex,toIndex);
  };
});
