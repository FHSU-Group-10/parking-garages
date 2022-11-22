(function (window) {
    function pageCtrl ($scope, $http, $document) {
        
        let data = {
            foundReservation: true
        }
        
        const searchCriteria = {
            license: '',
            garageId: '',
            reservationId: '',
            state: ''
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