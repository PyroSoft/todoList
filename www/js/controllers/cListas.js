var app = angular.module('starter.cListas', ['ngCordova']);

app.controller('listasCtrl',function ($scope,initDbService,$ionicPlatform,databaseFactory,$ionicPopup,$actionButton,$ionicPopover) {
  $scope.listas = [];

  $scope.editList = {
    "showEdit" : false
  };

  $ionicPlatform.ready(function () {
    initDbService.createTableService();
    $scope.listas = databaseFactory.loadListaService();
  });

  $scope.$on('$ionicView.enter',function () {
    var actionButton = $actionButton.create({
      mainAction: {
        icon: 'ion-plus-round',
        backgroundColor: '#00BCD4',
        textColor: 'white',
        onClick: function () {
          $scope.addList();
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
    $scope.editList.showEdit = true;
    $scope.popover.hide();
  };

  /*Scope Methods*/

  $scope.addList = function () {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" id = "listInput" ng-model="listas.lista">'+
                '<p>{{30 - listas.lista.length}} caracteres</p>',
      title: 'Nueva lista',
      subTitle: 'Crear una nueva lista',
      scope: $scope,
      //defaultText: 'Prueba',
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Guardar</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.listas.lista) {
              //don't allow the user to close unless he enters something
              e.preventDefault();
            } else {
              if($scope.listas.lista.length > 30){
                var alertPopup = $ionicPopup.alert({
                  title: 'Ups!',
                  template: 'Puedes ingresar hasta 30 caracteres'
                });
              }else {
                $scope.listas = databaseFactory.insertListaService($scope.listas.lista);
              }
            }
          }
        }
      ]
    });
  };

  $scope.removeList = function (index) {
    $scope.listas = databaseFactory.deleteListaService(index);
  };

  $scope.updateList = function (iLista) {
    var modifyPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="listas.lista">'+
                '<p>{{30 - listas.lista.length}} caracteres</p>',
      title: 'Editar lista',
      subTitle: 'Ingresa un nuevo nombre a tu lista',
      scope: $scope,
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Guardar</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.listas.lista) {
              //don't allow the user to close unless he enters something
              e.preventDefault();
            } else {
              if($scope.listas.lista.length > 30) {
                var alertPopup = $ionicPopup.alert({
                  title: 'Ups!',
                  template: 'Puedes ingresar hasta 30 caracteres'
                });
              }else {
                $scope.listas = databaseFactory.modifyListaService($scope.listas.lista,iLista);
              }
            }
          }
        }
      ]
    });
  };
});
