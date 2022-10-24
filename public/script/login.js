(function (window) {
    function pageCtrl ($scope, $http, $document) {
        
        const URLS = {
            login: '/user/login'
        }
        
        const Login = {
            username: '',
            password: ''
        }
        
        function login() {
            $http.post(URLS.login, {Login})
                .then((resp) => {
                    console.dir(resp); // debug - remove
                }) // TODO: handle error message
        }
        return {
            login,
            Login
        }
    }
    
    var app = angular.module('pageApp', []);
    app.controller("pageCtrl", [
        '$scope' ,
        '$http',
        '$document',
        pageCtrl]);
})(window)