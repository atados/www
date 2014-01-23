'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('RootCtrl', function ($scope, $rootScope, $state, Auth) {
  $scope.getLoggedUser = Auth.getUser;

  $scope.$watch('getLoggedUser()', function (value) {
    $scope.loggedUser = value;
    if ($rootScope.modalInstance) {
      $rootScope.modalInstance.close();
    }
    if ($scope.loggedUser && $scope.loggedUser.role === constants.NONPROFIT) {
      $scope.loggedUser.address = $scope.loggedUser.user.address;
      $scope.loggedUser.causes.forEach(function (c) {
        c.image = constants.storage + 'cause_' + c.id + '.png';
      });
      $scope.loggedUser.projects.forEach(function (p) {
        p.causes.forEach(function (c) {
          c.image = constants.storage + 'cause_' + c.id + '.png';
        });
      });
    }
  });

  $rootScope.$on('userLoggedIn', function(event, user) {
    if (user) {
      if ($rootScope.modalInstance) {
        $rootScope.modalInstance.close();
      }
      $scope.loggedUser = user;
      if ($scope.loggedUser.role === constants.NONPROFIT) {
        $state.transitionTo('root.nonprofitadmin({slug: ' + $scope.loggedUser.slug + '})');
      } else if ($scope.loggedUser.role === constants.VOLUNTEER) {}
      else {
        toastr.error('Usuário desconhecido acabou de logar.');
        // TODO(mpomarole): proper handle this case and disconect the user. Send email to administrador.
      }
      toastr.success('Oi! Bom te ver por aqui :)', $scope.loggedUser.slug);
    }
  });

  $scope.logout = function () {
    toastr.success('Tchau até a próxima :)', $scope.loggedUser.slug);
    $scope.$emit('userLoggedOut');
    Auth.logout();
    $scope.loggedUser = null;
    $state.transitionTo('root.home');
  };
});
