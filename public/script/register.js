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
                error_modal.message = error.data;
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

        const success_modal = {
            hide: () => {
                $('#success-modal').modal('hide');

            },
            show: () => {
                $('#success-modal').modal('show');
            }
        };

        let loading = 0;

        function submitNewUser() {
            loading_modal.show(); // show our loading icon
            $http.post(URLS.register, { newUser })
                .then((resp) => {
                    success_modal.show();
                }, (reject) => {
                    error_modal.show(reject);
                });

            loading_modal.hide();
        }
        return {
            error_modal,
            loading,
            newUser,
            success_modal,
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