'use strict';

/* global toastr: false */

var app = angular.module('atadosApp');

app.controller('GddNonprofitAdminCtrl', function($scope, $http, $state, $stateParams, $timeout, Restangular, Photos, Cleanup, api, VOLUNTEER, NONPROFIT) {

  $scope.volunteerStatusOptions = [
    'Voluntário',
    'Candidato',
    'Desistente',
    'Ex-Voluntário'
  ];

  function setStatusStyle(volunteer) {
    if (volunteer.status === 'Voluntário') {
      volunteer.statusStyle = {color: 'green'};
    } else if (volunteer.status === 'Desistente') {
      volunteer.statusStyle = {color: 'red'};
    } else if (volunteer.status === 'Candidato') {
      volunteer.statusStyle = {color: '#0081B2'};
    } else if (volunteer.status === 'Ex-Voluntário') {
      volunteer.statusStyle = {color: 'black'};
    }
  }

  function setProjectStatusStyle(project) {
    if (!project.published) {
      project.statusStyle = {'background-color': '#f2ae43'}; // label-warning color
    } else if (project.closed) {
      project.statusStyle = {'background-color': '#db524b'}; // label-danger color
    } else if (!project.closed) {
      project.statusStyle = {'background-color': '#58b957'}; // label-success color
    }
  }

  $scope.$watch('loggedUser', function (user) {
    if (!user) {
      $state.transitionTo('gdd.home');
      toastr.error('ONG precisa estar logada para acessar o Painel de Controle.');
      return;
    }
    if (user.role === VOLUNTEER && !user.user.is_staff) {
      $state.transitionTo('gdd.home');
      toastr.error('Apenas ONGs tem acesso ao Painel de Controle');
      return;
    } else if (user.role === VOLUNTEER && user.user.is_staff) {
      $http.get(api + 'nonprofit/'+ $stateParams.slug + '/')
        .success(function(response) {
          $scope.nonprofit = response;
          Cleanup.currentUser($scope.nonprofit);
          Cleanup.nonprofitForAdmin($scope.nonprofit);
          $scope.activeProject = $scope.nonprofit.projects[0];
        }).error(function() {
          $state.transitionto('gdd.home');
          toastr.error('ONG não encontrada.');
        });
    } else if (user.role === NONPROFIT) {
      $scope.nonprofit = $scope.loggedUser;
      Cleanup.nonprofitForAdmin($scope.nonprofit);
      $scope.activeProject = $scope.nonprofit.projects[0];
    }
  });

  $scope.changeActiveProject = function (newProject) {
    $scope.activeProject = newProject;
  };

  $scope.changeVolunteerStatus = function (volunteer, newStatus) {
    volunteer.status = newStatus;
    setStatusStyle(volunteer);
    $http.post(api + 'change_volunteer_status/', {volunteer: volunteer.email, project: $scope.activeProject.slug, volunteerStatus: volunteer.status});
  };

  $scope.editProject = function (project) {
    $state.transitionTo('gdd.editproject', {slug: project.slug});
  };

  $scope.cloneProject = function (project) {
    $http.post(api + 'project/' + project.slug + '/clone/').success(function (response) {
      Cleanup.adminProject(project, $scope.nonprofit);
      $scope.nonprofit.projects.push(response);
    });
  };

  $scope.closeOrOpenProject = function (project) {
    if (project.closed) {
      $http.put(api + 'open/project/', {'project': project.id}).then(function() {
        project.closed = false;
        setProjectStatusStyle(project);
      });
    } else {
      $http.put(api + 'close/project/', {'project': project.id}).then(function() {
        project.closed = true;
        setProjectStatusStyle(project);
      });
    }
  };

  $scope.exportList = function (project) {
    $http.get(api + 'project/' + project.slug + '/export/').success(function (response) {
      var dataUrl = 'data:text/csv;utf-9,' + encodeURI(response.volunteers);
      var link = document.createElement('a');
      angular.element(link)
        .attr('href', dataUrl)
        .attr('download', 'Voluntários ' + project.name); // Pretty much only works in chrome
      link.click();
    });
  };
});
