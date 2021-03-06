'use strict';

/* global toastr: false */
/* global $: false */

var app = angular.module('atadosApp');

app.controller('GddRootCtrl', function ($scope, $rootScope, $modal, $state, $location, $timeout, $http, api, Cookies,  Auth, loggedUser, NONPROFIT, storage, Search, saoPaulo, curitiba, brasilia, rioDeJaneiro, Site) {
  window.location = 'https://global.good-deeds-day.org/br';
  $scope.loggedUser = loggedUser;

  $scope.contact = function() {
    toastr.warning('Entre em contato através do email diadasboasacoes@atados.com.br');
  }

  Search.filter(null, null, null, null, true);

  if (window.location.hash === '#session-expired') {
    toastr.error('Oops! Parece que sua sessão expirou! Você precisa logar novamente');
    $state.transitionTo('root.home');
  }


  if ($rootScope.modalInstance) {
    $rootScope.modalInstance.close();
  }

  if ($scope.loggedUser && $scope.loggedUser.role === NONPROFIT) {
    $scope.loggedUser.address = $scope.loggedUser.user.address;
    $scope.loggedUser.causes.forEach(function (c) {
      c.image = storage + 'cause_' + c.id + '.png';
    });
    $scope.loggedUser.projects.forEach(function (p) {
      p.causes.forEach(function (c) {
        c.image = storage + 'cause_' + c.id + '.png';
      });
    });
  }

  $rootScope.explorerView = false;

  $scope.news = {
    email: '',
  };

  $scope.sendNews = function(e) {
    e.preventDefault();
    $http.post(api + 'add_to_gdd_newsletter/', $scope.news).success(function(response) {
      toastr.success(response.msg);
    }).error(function() {
      toastr.error('Um erro ocorreu.');
    });
  }

  $scope.logout = function () {
    toastr.success('Tchau, até a próxima :)', $scope.loggedUser.slug);
    $scope.$emit('userLoggedOut');
    Auth.logout();
    $scope.loggedUser = null;
    $state.transitionTo('gdd.home');
  };

  $rootScope.askForAddress = function(user) {
    $rootScope.addressModal = $modal.open({
      backdrop: 'static',
      keyboard: false,
      templateUrl: '/partials/addressModal.html',
      controller: ['$scope', 'Site', 'Restangular', 'Volunteer', '$rootScope', function ($scope, Site, Restangular, Volunteer, $rootScope) {
        $scope.states = Site.states;

        $scope.saveAddress = function() {
          if ($scope.city) {
            user.address = {city: $scope.city};
            Volunteer.save(user, function() {
              $rootScope.addressModal.close();
            }, function() {});
          } else {
            window.alert('Selecione sua cidade! :)');
          }
        };

        $scope.cityLoaded = false;
        $scope.$watch('state', function (value) {
          $scope.cityLoaded = false;
          $scope.stateCities = [];

          if (value) {
            Restangular.all('cities').getList({page_size: 3000, state: value.id}).then(function (response) {
              response.forEach(function(c) {
                $scope.stateCities.push(c);
              });

              value.citiesLoaded = true;
              $scope.cityLoaded = true;
            });
          }
        });
      }]
    });
  };

  // if ($scope.loggedUser && !$scope.loggedUser.address) {
  //   $rootScope.askForAddress($scope.loggedUser);
  // }

  $rootScope.$on('userLoggedIn', function(event, user, message, callback) {
    if (user) {
      $scope.loggedUser = user;
      if (!callback) {
        if (message) {
          toastr.success(message, $scope.loggedUser.slug);
        } else {
          toastr.success('Oi! Bom te ver por aqui :)', $scope.loggedUser.slug);
        }
        if ($rootScope.modalInstance) {
          $rootScope.modalInstance.close();
        }
        if (user.role === 'NONPROFIT') {
          $location.path('/dia-das-boas-acoes/controle/' + user.slug);
        }
      } else {
        callback();
      }
      // if (!user.address) {
      //   $rootScope.askForAddress(user);
      // }
    }
  });
});

app.config(function ($provide) {
  $provide.decorator('$uiViewScroll', function ($delegate) {
    return function (uiViewElement) {
      var top = uiViewElement[0].getBoundingClientRect().top;
      window.scrollTo(0, (top - 30));
    };
  });
});
