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
                loading_modal.hide(); // make sure we are never show at the same time
                error_modal.message = error.data.error;
                error_modal.status = error.status;
                $('#error-modal').modal('show');
            }
        }
    
        const loading_modal = {
            hide: () => {
                console.log('hiding'); // debug - remove
                $('#loading-modal').modal('hide');
    
            },
            show: () => {
                $('#loading-modal').modal('show');
            }
        }
        
        
        
        let loading = 0;
        
        function login() {
           loading_modal.show(); // show our loading icon
            $http.post(URLS.login, {Login})
                .then((resp) => {
                    if (resp.data.is_operator) window.location.href = 'http://localhost:3500/view/operator'; // TODO: replace with our final real URL
                    loading_modal.hide(); // hide loading scree
                }, (reject) => {
                    console.log(reject); // debug -r emvoe 
                    loading_modal.hide();
                    error_modal.show(reject);
                })
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