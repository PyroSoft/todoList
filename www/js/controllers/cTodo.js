var app = angular.module('starter.cTodo', ['ngCordova','$actionButton']);

app.controller('mainCtrl',function ($scope, $ionicPopup, $cordovaSQLite, $actionButton, databaseFactory, $ionicPlatform, initDbService) {

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
      template: '<input type="text" id = "todoInput" ng-model="todos.todo">',
      title: 'Nuevo elemento',
      subTitle: 'Adicionar un nuevo item en mi lista',
      scope: $scope,
      //defaultText: 'Prueba',
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Guardar</b>',
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
  };

  $scope.removeTodo = function (index) {
    $scope.todos = databaseFactory.deleteTodoService(index);
  };

  $scope.updateTodo = function (index) {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="todos.todo">',
      title: 'Editar elemento',
      subTitle: 'Modificar un item de mi lista',
      scope: $scope,
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Guardar</b>',
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
  };

  $scope.moveTodo = function (fromIndex, toIndex) {
    $scope.todos = databaseFactory.modifyTodoService($scope.todos[fromIndex].name,fromIndex,toIndex);
  };
});
