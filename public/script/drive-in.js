(function (window) {
    function pageCtrl ($scope, $http, $document) {
        
        let data = {
            foundReservation: true
        }
    
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
        }
    
        const loading_modal = {
            hide: () => {
                $('#loading-modal').modal('hide');
            
            },
            show: () => {
                $('#loading-modal').modal('show');
            }
        }
        
        const searchCriteria = {
            license: '',
            garageId: '',
            reservationId: '',
            state: ''
        }
        
        function buildAndFind (searchCriteria) {
            let searchObj = {}; // init search obj
            let sc = searchCriteria; // shorthand search criteria
            if (searchCriteria.reservationId) {
                searchObj = {reservationId: sc.reservationId}; // if we have a resevationId we need to use that
            } else {
                searchObj = {
                    garageId: sc.garageId,
                    license: sc.license,
                    state: sc.state
                } // use the othe params is no reservationId present
            }
        }
        
        function findReservation (search){
        
        }
        
        function init() {
        
        }
        
    
        return {
            data,
            searchCriteria
        }
    }
    var app = angular.module('pageApp', []);
    app.controller("pageCtrl", [
        '$scope' ,
        '$http',
        '$document',
        pageCtrl]);
})(window)