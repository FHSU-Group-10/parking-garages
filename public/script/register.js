(function (window) {
    function pageCtrl($scope, $http, $document, $timeout) {

        const URLS = {
            register: '/user/register'
        };
        // Object to hold values passed in by the user
        const newUser = {
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            is_operator: false
        };

        // Displays a dialogue box with an error message and description
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
        // Displays a dialogue box indicating successful registration
        const success_modal = {
            hide: () => {
                $('#success-modal').modal('hide');

            },
            show: () => {
                $('#success-modal').modal('show');
            }
        };

        let loading = 0;
        /**
         * Precondition:
         * - All object values are passed in to newUser
         * Postcondition:
         * - A new user object is passed to the controller to be added to the User DB table
         */
        function submitNewUser() {
            console.log("****", newUser);
            if (!newUser.username || !newUser.email || !newUser.first_name || !newUser.last_name || !newUser.password || !newUser.phone) {
                return;
            }
            loading_modal.show(); // show our loading icon
            $http.post(URLS.register, newUser)
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