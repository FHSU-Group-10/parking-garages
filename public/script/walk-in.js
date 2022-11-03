(function (window) {
    function pageCtrl ($scope, $http, $document) {
        
        let data = {
            durations: [
                {time: '30 minutes', value: 0.5},
                {time: '1 hour', value: 1.0},
                {time: '1 hour 30 minutes', value: 1.5},
                {time: '2 hours', value: 2.0},
                {time: '2 hours 30 minutes', value: 2.5},
                {time: '3 hours', value: 3.0},
                {time: '3 hours 30 minutes', value: 3.5},
                {time: '4 hours', value: 4.0},
                {time: '4 hours 30 minutes', value: 4.5},
                {time: '5 hours', value: 5.0},
                {time: '5 hours 30 minutes', value: 5.5},
                {time: '6 hours', value: 6.0},
                {time: '6 hours 30 minutes', value: 6.5},
                {time: '7 hours', value: 7.0},
                {time: '7 hours 30 minutes', value: 7.5},
                {time: '8 hours', value: 8.0},
                {time: '8 hours 30 minutes', value: 8.5},
                {time: '9 hours', value: 9.0},
                {time: '9 hours 30 minutes', value: 9.5},
                {time: '10 hours', value: 10.0},
                {time: '10 hours 30 minutes', value: 10.5},
                {time: '11 hours', value: 11.0},
                {time: '11 hours 30 minutes', value: 11.5},
                {time: '12 hours', value: 12.0},
            ],
            is_unregistered: false,
            is_registered: false,
            has_reservations: true,
            reservations: [],
        }
        
        function backToMain() {
            data.is_registered = false
            data.is_unregistered = false
            data.has_reservations = true
            data.reservations = [];
        }
        
        function init() {console.log('hello')}
        
        init();
        return {
            backToMain: backToMain,
            data: data
        }
    }
    var app = angular.module('pageApp', []);
    app.controller("pageCtrl", [
        '$scope' ,
        '$http',
        '$document',
        pageCtrl]);
})(window)