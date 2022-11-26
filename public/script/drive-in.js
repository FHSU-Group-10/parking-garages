(function (window) {
    function pageCtrl ($scope, $http, $document) {
        
        let data = {
            foundReservation: true
        }
    
        const URLS = {
            enter: '/user/login'
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
            plateNumber: '',
            garageId: '',
            reservationCode: '',
            plateState: ''
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
            
            findAndEnter(searchObj);
        }
        
        function canFind() {
            let sc = searchCriteria;
            console.log(!!(searchCriteria.garageId && ((searchCriteria.plateNumber && searchCriteria.plateState) || searchCriteria.reservationCode)))// debug - remove
            return (!!(sc.garageId && ((sc.plateNumber && sc.plateState) || sc.reservationCode)))
        }
        
        function findAndEnter(search){
            loading_modal.show(); // show our loading icon
            $http.post(URLS.enter, search)
                .then((resp) => {
                    console.dir(resp); // debug - remove
                }, (reject) => {
                    error_modal.show(reject);
                })
                .finally(loading_modal.hide)
        }
        
        function init() {
        
        }
        
    
        return {
            buildAndFind,
            canFind,
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