(function (window) {
    function pageCtrl ($scope, $http, $document, $timeout) {
        
        const URLS = {
            login: '/user/login'
        }
        
        const Login = {
            username: '',
            password: ''
        }
        
        
        
        let loading = 0;
        
        function login() {
            console.log('function ran'); // debug - remove
            console.dir(loading); // debug - remove
            loading = 1;
            console.dir(loading); // debug - remove
            $http.post(URLS.login, {Login})
                .then((resp) => {
                    loading=0;
                    console.dir(resp); // debug - remove
                }) // TODO: handle error message
        }
        return {
            loading,
            login,
            Login
        }
    }
    
    var app = angular.module('pageApp', []);
    app.controller("pageCtrl", [
        '$scope' ,
        '$http',
        '$document',
        '$timeout',
        pageCtrl]);
})(window)