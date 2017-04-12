var app = angular.module('starter.cTodo', ['ngCordova','$actionButton']);

app.controller('mainCtrl',function ($scope, $ionicPopup, $cordovaSQLite, $actionButton, databaseFactory, initDbService,$cordovaSocialSharing,$stateParams) {

  /*Variables*/
  $scope.editTodo = {
    "showEdit" : false
  };

  $scope.todos = [];

  /*Events*/
  /*$ionicPlatform.ready(function () {
    initDbService.createTableService();
    $scope.todos = databaseFactory.loadTodoService();
  })*/

  $scope.$on('$ionicView.enter',function () {
    var iLista = parseInt($stateParams.index)+1;
    $scope.todos = databaseFactory.loadTodoService(iLista);
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
              var iLista = parseInt($stateParams.index)+1;
              $scope.todos = databaseFactory.insertTodoService($scope.todos.todo,iLista);
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

  $scope.share = function () {
    var msg = "MI LISTA\n";

    if($scope.todos.length > 0){
      for(var i = 1; i <= $scope.todos.length; i++){
        msg = msg.concat("\n"+ i + " - " + $scope.todos[i-1].name);
      }
      msg = msg.concat("\n\n(Developed by PyroSoft)");
      $cordovaSocialSharing.share(msg);

      if(log) {
        console.log("Shared " + $scope.todos.length + " todos");
      }
    }else{
      var alertPopup = $ionicPopup.alert({
        title: 'Ups!',
        template: 'No tienes elementos para compartir'
      });
    }
  }
});
