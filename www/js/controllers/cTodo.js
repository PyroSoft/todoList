var app = angular.module('starter.cTodo', ['ngCordova','$actionButton']);

app.controller('mainCtrl',function ($scope, $ionicPopup, $cordovaSQLite, $actionButton, databaseFactory, initDbService,$cordovaSocialSharing,$stateParams,$ionicPopover) {

  /*Variables*/
  $scope.editTodo = {
    "showEdit" : false
  };

  $scope.todos = [];
  $scope.listLabel = "";

  $scope.$on('$ionicView.enter',function () {
    $scope.listLabel = databaseFactory.listLabelService($stateParams.index);
    $scope.todos = databaseFactory.loadTodoService($stateParams.index);
    var actionButton = $actionButton.create({
      mainAction: {
        icon: 'ion-plus-round',
        backgroundColor: '#00BCD4',
        textColor: 'white',
        onClick: function () {
          $scope.addTodo();
        }
      }
    });
  });

  /*popOver*/
  var pOver_template =
    '<ion-popover-view class="fit">' +
    ' <ion-content scroll="false">' +
    '   <ion-list class="list">'+
    '     <ion-item class="item item-icon-right" ng-click="popEdit()">'+
    '       <h2>Editar</h2>'+
    '     </ion-item>'+
    '     <ion-item class="item item-icon-right" ng-click="share()">'+
    '       <h2>Compartir</h2>'+
    '     </ion-item>'+
    '   </ion-list>' +
    ' </ion-content>' +
    '</ion-popover-view>';

  $scope.popover = $ionicPopover.fromTemplate(pOver_template, {
    scope: $scope
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.popEdit = function () {
    $scope.editTodo.showEdit = true;
    $scope.popover.hide();
  };

  /*Scope Methods*/

  $scope.addTodo = function () {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" id = "todoInput" ng-model="todos.todo">' +
                '<p>{{30 - todos.todo.length}} caracteres</p>',
      title: 'Nuevo elemento',
      subTitle: 'Adicionar un nuevo item en mi lista.',
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
              if($scope.todos.todo.length > 30){
                var alertPopup = $ionicPopup.alert({
                  title: 'Ups!',
                  template: 'Puedes ingresar hasta 30 caracteres'
                });
              }else{
                $scope.todos = databaseFactory.insertTodoService($scope.todos.todo,$stateParams.index);
              }
            }
          }
        }
      ]
    });
  };

  $scope.removeTodo = function (index) {
    $scope.todos = databaseFactory.deleteTodoService(index,$stateParams.index);
  };

  $scope.updateTodo = function (index) {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="todos.todo">' +
                '<p>{{30 - todos.todo.length}} caracteres</p>',
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
              if($scope.todos.todo.length > 30) {
                var alertPopup = $ionicPopup.alert({
                  title: 'Ups!',
                  template: 'Puedes ingresar hasta 30 caracteres'
                });
              }else{
                  $scope.todos = databaseFactory.modifyTodoService($scope.todos.todo, index, index, $stateParams.index);
              }
            }
          }
        }
      ]
    });
  };

  $scope.moveTodo = function (fromIndex, toIndex) {
    $scope.todos = databaseFactory.modifyTodoService($scope.todos[fromIndex].name,fromIndex,toIndex,$stateParams.index);
  };

  $scope.share = function () {
    var msg = $scope.listLabel.toUpperCase().concat("\n");
    $scope.popover.hide();

    if($scope.todos.length > 0){
      for(var i = 1; i <= $scope.todos.length; i++){
        msg = msg.concat("\n"+ i + " - " + $scope.todos[i-1].name);
      }
      //msg = msg.concat("\n\n(Developed by PyroSoft)");
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
