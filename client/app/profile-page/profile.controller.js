'use strict';

angular.module('tikrApp')
  .controller('ProfileCtrl', function ($scope, $http, $rootScope, $modal, messageService, $stateParams, $location, Auth, User) {
    /*
    //$scope.awesomeThings = [];

    //$http.get('/api/things').success(function(awesomeThings) {
    //  $scope.awesomeThings = awesomeThings;
    //});


    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };
    */
    //$scope.userProfile = {};
    $scope.currentUsername = $stateParams.username;
    $scope.showFormToAddSkills = false;
    $scope.getUserProfile = function(){
      var githubUsername = $stateParams.username;
      var url = 'api/users/profiles/'+githubUsername;

      return $http({
        method: 'GET',
        url: url
      }).
      success(function(profile/*, status, headers, config*/) {
        $scope.userProfile = profile;
        return;
      }).
      error(function(data, status/*headers, config*/) {
        console.log('There has been an error', data);
        if (status === 404){
          $location.path('/pagenotfound');
        }
        return data;
      });
    };

    $scope.isLoggedInAsCurrentUser = function(){
      var currentUserPage = $stateParams.username;
      var loggedInUser = Auth.getCurrentUser();
      //console.log(loggedInUser);
      if (loggedInUser.github && loggedInUser.github.login){
        //console.log("LOGGING LINE 51", loggedInUser.github.login, currentUserPage);
        if (loggedInUser.github.login === currentUserPage){
          return true;
        }
      }
      return false;
    };

    $scope.showAddSkillsForm = function(){
      $scope.showFormToAddSkills = true;
    };

    $scope.addASkill = function(formdata){
      $scope.showFormToAddSkills = false;
      var newSkillName = $scope.skillname;
      var newSkillLink = $scope.githublink;
      //console.log(formdata);
      if (formdata.$valid){
        //submit POST request to server to add a skill to the current user's profile
        var githubUsername = $stateParams.username;
        var url = 'api/users/profiles/'+githubUsername;

        $http.post(url, {skillname: newSkillName, githublink: newSkillLink}).
        success(function(profile/*status, headers, config*/) {
          $scope.userProfile = profile;
        }).
        error(function(data, status, headers, config) {
          console.log("Error adding skill", data, status);
        });
      }
    };

    $scope.sendMessage = function(title, text, userID){
      var newMessage = {
        userGithubID: userID,
        title: title,
        message: text
      };
      
      messageService.create(newMessage).then(function () {
        console.log('sent message');
      }, function () {
        console.log('failed to send message');
      });
    };

    $scope.sendMessageModal = function(user){
      var modalScope = $rootScope.$new();
      modalScope.messageTitle = '';
      modalScope.messageText = '';
      var modalClass = 'modal-default';
      modalScope.modal = {
        dismissable: true,
        title: 'Sending Message to: '+user.name,
        buttons: [{
          classes: 'btn-danger',
          text: 'Send',
          click: function(e) {
            $scope.sendMessage(modalScope.messageTitle, modalScope.messageText, user.github.id);
            $scope.messageModal.close(e);
          }
        }, {
          classes: 'btn-default',
          text: 'Cancel',
          click: function(e) {
            $scope.messageModal.dismiss(e);
          }
        }]
      };

      $scope.messageModal = $modal.open({
        templateUrl: 'app/profile-page/messageDialog.html',
        windowClass: modalClass,
        scope: modalScope,
        controller: 'ProfileCtrl'
      });
    };

    $scope.getUserProfile();

    $scope.hasSkills = function(){
      if ($scope.userProfile && $scope.userProfile.skills){
        return true;
      } else {
        return false;
      }
    };

  });
