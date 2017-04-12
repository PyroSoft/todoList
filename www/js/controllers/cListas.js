var app = angular.module('starter.cListas', ['ngCordova']);

app.controller('listasCtrl',function ($scope,initDbService,$ionicPlatform,databaseFactory,$ionicPopup,$actionButton) {
  $scope.listas = [];


  $ionicPlatform.ready(function () {
    initDbService.createTableService();
    $scope.listas = databaseFactory.loadListaService();
  });

  $scope.$on('$ionicView.enter',function () {
    var actionButton = $actionButton.create({
      mainAction: {
        icon: 'ion-plus-round',
        backgroundColor: '#9E9E9E',
        textColor: 'white',
        onClick: function () {
          $scope.addList();
        }
      }
    });
  });

  /*Scope Methods*/

  $scope.addList = function () {
    var addPopup = $ionicPopup.show({
      template: '<input type="text" id = "listInput" ng-model="listas.lista">',
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
              $scope.listas = databaseFactory.insertListaService($scope.listas.lista);
            }
          }
        }
      ]
    });
  };
});
