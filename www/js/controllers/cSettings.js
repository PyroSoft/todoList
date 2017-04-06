var app = angular.module('starter.cSettings', ['ngCordova']);

app.controller('settingCtrl',function ($scope,databaseFactory,$ionicPopup) {
  $scope.flushDb = function () {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirma operacion',
      template: 'Estas seguro que quieres limpiar el listado actual?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        databaseFactory.flushDbService();
      }
    });
  };
});
