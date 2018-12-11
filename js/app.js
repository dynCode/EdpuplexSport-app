var module = angular.module('app', ['onsen', 'ngSanitize']);

// angular data filters
module.filter('externalLinks', function() {
    return function(text) {
        //return String(text).replace(/href=/gm, "class=\"ex-link\" href=");
        //return String(text).replace(/href=/gm, "ng-click=\"exLink()\" href=");
        //
        // NOTE:
        // can't use ng-click as it is not in Angular Land as $sce and ng-bind-html
        // ALSO - must do filters in this order 'content | externalLinks | to_trusted'
        //        so this string stays in content
        return String(text).replace(/href=/gm, "onclick=\"angular.element(this).scope().exLink(this);return false\" href=");
    };
});

module.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

module.controller('AppController', function($scope, $http, $window, $timeout) {
    $scope.apiPath = 'https://eduplexsport.co.za/dash/api/appApi.php';
    $scope.data = [];

    //Membder Data
    $scope.userLoggedin = false;
    $scope.uid = '';
    $scope.userNS = ''; 
    $scope.uType = '';
    $scope.deps = [];
    $scope.dacuid = '';
    
    $scope.init = function() {
        var user = $window.localStorage.getItem('esUser'); 
        var pass = $window.localStorage.getItem('esPass'); 
        var keep = $window.localStorage.getItem('esKeep');

        if (user && pass) {
            //modal.show();
            $scope.data.errorCode = 'Checking if you are logged in...';
            $http.post($scope.apiPath, {"reqType" : "login", "user" : user, "pass" : pass})
            .success(function(data, status){
                if (data['error'] == 0) {
                    console.log("Data:", data);
                    //modal.hide();
                    $scope.uid = data['uid'];
                    $scope.userNS = data['userNS']; 
                    $scope.uType = data['uType'];
                    $scope.deps = data['deps'];
                    $scope.userLoggedin = true;
                } 
                $timeout(function(){
                    myNavigator.pushPage('views/home.html', { animation : 'fade' });
                },'2000');
            })
            .error(function(data, status) {
                $timeout(function(){
                    myNavigator.pushPage('views/login.html', { animation : 'fade' });
                },'2000');
            });
        } else {
            $timeout(function(){
                myNavigator.pushPage('views/login.html', { animation : 'fade' });
            },'2000');
        }
    };

    //side nav tools
    $scope.openMenu = function () {
        var menu = document.getElementById('menu');
        menu.open();
    };

    $scope.loadPage = function (page) {
        var menu = document.getElementById('menu');

        menu.close();
        myNavigator.resetToPage(page, { animation: 'fade' });
    };

    $scope.closeMenu = function () {
        var menu = document.getElementById('menu');          
        menu.close();
    };

    // login checker
    $scope.LogIn = function() {
        var user = $scope.data.username;
        var pass = $scope.data.password;

        if (user && pass) {
            modal.show();
            $scope.data.errorCode = 'Processing, please wait...';
            $http.post($scope.apiPath, {"reqType" : "login", "user" : user, "pass" : pass})
            .success(function(data, status){
                if (data['error'] == 0) {
                    console.log("Data:", data);
                    modal.hide();
                    $scope.uid = data['uid'];
                    $scope.userNS = data['userNS']; 
                    $scope.uType = data['uType'];
                    $scope.deps = data['deps'];

                    modal.show();
                    $scope.data.errorCode = 'Collecting your data...';

                    if ($scope.data.keepLoggedIn) {
                        $window.localStorage.setItem('esUser',user); 
                        $window.localStorage.setItem('esPass',pass);
                    }

                    $timeout(function(){
                        modal.hide();
                        $scope.data = [];
                        myNavigator.pushPage('views/home.html', { animation : 'fade' });
                    },'2000');
                } else {
                    modal.hide();
                    $scope.data.result = data['html'];
                    $scope.data.errorCode = data['html'];
                    console.log(data['html']);
                    modal.show();
                    ons.notification.alert({
                        message: data['html'],
                        title: 'Oops!',
                        buttonLabel: 'OK',
                        animation: 'default'
                    });
                }
            })
            .error(function(data, status) {
                modal.hide();
                ons.notification.alert({
                    message: 'Request failed. Try Again!',
                    title: 'Oops!',
                    buttonLabel: 'OK',
                    animation: 'default'
                });
            });
        } else {
            $scope.data.errorCode = 'Username or Password.';
            ons.notification.alert({
                message: 'Username or Password!',
                title: 'Oops!',
                buttonLabel: 'OK',
                animation: 'default'
            });
        }
    };
    
    // logout checker
    $scope.LogOut = function() {
        modal.show();
        $scope.data.errorCode = 'Processing, please wait...';
        $timeout(function(){
            modal.hide();
            $scope.data = [];
            $window.localStorage.removeItem('esUser'); 
            $window.localStorage.removeItem('esPass'); 
            myNavigator.pushPage('views/login.html', { animation : 'fade' });
        },'2000');
    };
    
    // dependant Access Card
    $scope.depsAccessCard = function(did) {
        $scope.dacuid = did;
        myNavigator.pushPage('views/depAccessCards.html', { animation : 'fade' });
    };
});
