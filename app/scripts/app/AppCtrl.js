'use strict';

/* global constants: false */

var app = angular.module('atadosApp');

app.controller('AppCtrl', function($scope, $rootScope, $modal, $state, $location, $anchorScroll, Site, Search) {
  
  $scope.site = Site;
  $scope.search = Search;
  $rootScope.modalInstance = null;
  $scope.storage = constants.storage;
  $scope.causes = Site.causes;
  $scope.skills = Site.skills;
  $scope.cities = Site.cities;
  $scope.states = Site.states;
  $scope.numbers = Site.numbers;

  $scope.citySearch = function (city) {
    $scope.cities().forEach(function (c) {
      if (c.name === city) {
        $scope.search.city = c;
        $location.hash('top');
        $anchorScroll();
        return;
      }
    });
  };

  $scope.siteSearch = function () {
    console.log($scope.search.query);
    $state.transitionTo('root.explore');
    $scope.search.query = $scope.search.landingQuery;
    $scope.search.landingQuery = '';
  };

  $scope.openLogin = function(type) {

    $rootScope.modalInstance = $modal.open({
      templateUrl: '/partials/loginModal.html',
      controller: ['$scope', function ($scope) {
        if (type === 'volunteer') {
          $scope.volunteerActive = true;
        } else if (type === 'nonprofit') {
          $scope.volunteerActive = false;
        } else {
          $scope.volunteerActive = true;
        }
      }]
    });
  };

  $scope.openTermsModal = function() {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/partials/termsModal.html'
    });
  };

  $rootScope.closeNonprofitLoginModal = function () {
    $rootScope.modalInstance.close();
  };
});
