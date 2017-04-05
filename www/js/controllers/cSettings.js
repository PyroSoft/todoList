var app = angular.module('starter.cSettings', ['ngCordova']);

app.controller('settingCtrl',function ($scope,databaseFactory) {
  $scope.flushDb = function () {
    databaseFactory.flushDbService();
  };
});
