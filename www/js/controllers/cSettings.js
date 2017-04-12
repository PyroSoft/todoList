var app = angular.module('starter.cSettings', ['ngCordova']);

app.controller('settingCtrl',function ($scope,databaseFactory,$ionicPopup) {
  $scope.flushDb = function () {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Restaurar configuración',
      template: '¿Estás seguro que quieres restaurar los valores por defecto? Esto eliminará todas las listas'
    });

    confirmPopup.then(function(res) {
      if(res) {
        databaseFactory.flushDbService();
      }
    });
  };
});
