(function (window) {
    function pageCtrl ($scope, $http, $document, $timeout) {
        
        const URLS = {
            login: '/user/login'
        }
        
        const Login = {
            username: '',
            password: ''
        }
        
        const error_modal = {
            message: '',
            status: '',
            show: (error) => {
                error_modal.message = error.data.error;
                error_modal.status = error.status;
                $('#error_modal').modal('show');
            }
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
                    if (resp.data.is_operator) window.location.href = 'http://localhost:3500/view/operator'
                    console.dir(resp); // debug - remove
                }, (reject) => {
                    error_modal.show(reject);
                    console.dir(reject); // debug - remove
                }) // TODO: handle error message
        }
        return {
            error_modal,
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