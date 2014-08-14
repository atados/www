'use strict';

/* global google: false */
/* global OverlappingMarkerSpiderfier: false */
/* global $: false */

var constants = {
  map: null,
  markers: []
};

var app = angular.module('atadosApp');

app.controller('ExplorerCtrl', function ($scope, $rootScope, $filter,
      notselected, selected, defaultZoom, saoPaulo) {

  $scope.site.title = 'Atados - Explore';
  $rootScope.explorerView = true;
  $scope.landing = false;

  $scope.$on('$destroy', function () {
    $rootScope.explorerView = false;
  });

  function resizeExploreElements () {
    var newSize = window.innerHeight - $('.navbar-header').height() - 5;
    $('.atados-explorer').height(newSize - 40);
    $('.map-outer .map').height(newSize);
  }
  resizeExploreElements();
  $(window).resize(resizeExploreElements);

  // Getting more cards when scrolling to the bottom of the page
  $('.atados-explorer').scroll(function() {
    if($('.atados-explorer').scrollTop() >= $('#searchSpace').height() - $(window).height()) {
      $scope.getMore();
    }
  });

  $scope.objects = $scope.search.mapProjects();
  $scope.search.showProjects = true;
  $scope.mapOptions = {
    map : {
      center : new google.maps.LatLng(saoPaulo.lat, saoPaulo.lng),
      zoom : defaultZoom
    },
    marker : {
      clickable : true,
      draggable : false
    }
  };
  $scope.previousMarker = null;
  $scope.iw = new google.maps.InfoWindow();
  $scope.oms = null;

  function addMarkersToOms() {
      for (var m in constants.markers) {
        constants.markers[m].setIcon(notselected);
        constants.markers[m].setZIndex(1);
        if ($scope.oms) {
          $scope.oms.addMarker(constants.markers[m]);
        }
      }
  }

  $scope.$on('gmMarkersUpdated', function() {
    if (constants.map && !$scope.oms) {
      $scope.oms = new OverlappingMarkerSpiderfier(constants.map);
      $scope.oms.addListener('spiderfy', function() {
        $scope.iw.close();
      });
      $scope.oms.addListener('unspiderfy', function () {
        $scope.iw.close();
      });
      $scope.oms.addListener('click', $scope.selectMarker);
    }
    addMarkersToOms();
  });

  $scope.$watch('search.projects()', function () {
    if ($scope.search.showProjects) {
      $scope.objects = $scope.search.mapProjects();
    }
  });

  $scope.$watch('search.nonprofits()', function () {
    if (!$scope.search.showProjects) {
      $scope.objects = $scope.search.mapNonprofits();
    }
  });
  
  $scope.$watch('search.showProjects', function () {
    if ($scope.search.showProjects) {
      $scope.objects = $scope.search.mapProjects();
    } else {
      $scope.objects = $scope.search.mapNonprofits();
    }
  });

  // Called whenever a marker is selected or a card is moused over.
  $scope.selectMarker = function (marker, object) {
    if ($scope.previousMarker) {
      $scope.previousMarker.setIcon(notselected);
      angular.element(document.querySelector('#card-' + $scope.previousMarker.slug))
        .removeClass('hover');
      $scope.previousMarker.setZIndex(1);
      $scope.previousMarker = null;
      $scope.hasAddress = false;
      $scope.distanceAddress = false;
      $('.map').css('opacity', 1);
    }
    
    if (object && !marker) {
      marker = constants.markers[object.slug];
    }

    if (marker) {
      var cardId = 'card-' + marker.slug;
      // TODO: Show icon card without center the map. Have to look up Google Maps recommendation again
      //$scope.iw.setContent(marker.title);
      //$scope.iw.open(constants.map, marker); // Also centers to the marker
      marker.setIcon(selected);
      marker.setZIndex(100);
      angular.element(document.querySelector('#' + cardId))
        .addClass('hover');
      $scope.previousMarker = marker;
      if (object.address && (object.address.longitude === 0 || object.address.latitude === 0)) {
        $scope.hasAddress = true;
        $('.map').css('opacity', 0.1);
      } else if (object.address.city === 0) {
        $scope.distanceAddress = true;
        $('.map').css('opacity', 0.1);
      }
    }
  };

  $scope.getMarkerOpts = function (object) {
    var titleStr = '';
    if (object.user) {
      titleStr = '<div id="info-window"><h4><a href="/ong/' + object.slug + '">' + object.name + '</a></h4><p>' +
        $filter('as_location_string')(object.address) + '</p></div>';
    } else {
      titleStr = '<div id="info-window"><h4><a href="/ato/' + object.slug + '">' + object.name + '</a></h4><p>' +
        $filter('as_location_string')(object.address) + '</p></div>';
    }
    return {title: titleStr, slug: object.slug};
  };

});
