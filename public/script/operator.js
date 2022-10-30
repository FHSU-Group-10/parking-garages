(function (window) {
    function priceCtrl($scope, $http, $document, $timeout) {

        const URLS = {
            pricing: '/pricing/updatePricing'
        };

        const price = {
            singleRes: 'single',
            singleCost: '',
            guaranteedRes: 'guaranteed',
            guaranteedCost: '',
            walkInRes: 'walkIn',
            walkInCost: '',
            dailyMax: ''
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

        function submit() {
            loading_modal.show(); // show our loading icon
            console.log('form submitted', price);
            $http.post(URLS.pricing, { price })
                .then((resp) => {
                    console.log('****', resp);
                }, (reject) => {
                    error_modal.show(reject);
                })
                .finally(loading_modal.hide);
        }
        return {
            error_modal,
            loading,
            submit,
            price
        };
    }


    var app = angular.module('priceApp', []);

    app.controller("priceCtrl", [
        '$scope',
        '$http',
        '$document',
        '$timeout',
        priceCtrl]);
})(window);