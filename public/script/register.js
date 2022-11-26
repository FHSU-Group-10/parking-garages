(function (window) {
    function pageCtrl($scope, $http, $document, $timeout) {

        const URLS = {
            register: '/user/register'
        };

        const newUser = {
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            is_operator: false
        };


        const error_modal = {
            message: '',
            status: '',
            close: () => {
                $('.modal').modal('hide');
            },
            show: (error) => {
                error_modal.message = error.data.error;
                error_modal.status = error.status;
                $('#error-modal').modal('show');
            }
        };

        const loading_modal = {
            hide: () => {
                $('#loading-modal').modal('hide');

            },
            show: () => {
                $('#loading-modal').modal('show');
            }
        };



        let loading = 0;

        function submitNewUser() {
            console.log("inside submitNewUser", newUser);
            loading_modal.show(); // show our loading icon
            $http.post(URLS.register, { newUser })
                .then((resp) => {
                    loading_modal.hide();
                }, (reject) => {
                    error_modal.show(reject);
                });

            loading_modal.hide();
        }
        return {
            error_modal,
            loading,
            newUser,
            submitNewUser,
        };
    }


    const app = angular.module('pageApp', []);

    app.controller("pageCtrl", [
        '$scope',
        '$http',
        '$document',
        '$timeout',
        pageCtrl]);
})(window);