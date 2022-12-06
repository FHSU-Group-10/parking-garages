(function (window) {
    function pageCtrl ($scope, $http, $document, $timeout) {
        
        let data = {
            failure: 0,
            enter: false,
            exit: false,
            foundReservation: true,
            reservation: {}
        }
        
        const URLS = {
            enter: '/access/enter',
            exit: '/access/exit',
        }
        
        const error_modal = {
            message: '',
            status: '',
            close: () => {
                $('.modal').modal('hide');
            },
            show: (error) => {
                error_modal.message = error.data.message || error.data.error;
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
        
        const thankyou_modal = {
            message: '',
            status: '',
            hide: () => {
                $('#thank-you-modal').modal('hide');
                
            },
            show: (message,title) => {
                thankyou_modal.message = message;
                thankyou_modal.title = title;
                $('#thank-you-modal').modal('show');
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
            searchObj = {
                garageId: Number(sc.garageId), // convert to number, has to be an integer
                plateNumber: sc.plateNumber,
                plateState: sc.plateState,
                reservationCode: sc.reservationCode || null
            } // use the othe params is no reservationId present
            
            
            findAndEnter(searchObj);
        }
        
        // function canFind() {
        //     let sc = searchCriteria;
        //     console.log(!!(searchCriteria.garageId && ((searchCriteria.plateNumber && searchCriteria.plateState) || searchCriteria.reservationCode)))// debug - remove
        //     return (!!(sc.garageId && ((sc.plateNumber && sc.plateState) || sc.reservationCode)))
        // }
        
        function findAndEnter(search){
            loading_modal.show(); // show our loading icon
            
            $http.post(URLS.enter, search)
                .then((resp) => {
                    data.reservation = resp.data;
                    if (data.reservation.floorNumber && data.reservation.spaceNumber) {
                        data.enter = true;
                        data.foundReservation = true;
                    }
                }, (reject) => {
                    error_modal.show(reject);
                    data.foundReservation = false;
                    data.failure++;
                })
                .finally(loading_modal.hide)
        }
        /*
            The function to call when the user is exiting the garage.
            
            Search will be the whole search object.
         */
        function exitGarage (search) {
            loading_modal.show();
            $http.post(URLS.exit, search)
                .then((resp) => {
                    thankyou_modal.show('Reservation completed successfully', 'Thank you!');
                    if (resp.data == "OK") {
                        $timeout(function () {
                            for (let [key,value] of Object.entries(searchCriteria)) {
                                searchCriteria[key] = '';
                            } // reset all of the searchCriteria fields.
        
                            thankyou_modal.hide();
                        }, 5000);
                    } // reset after 5 second delay
                }, (reject) => {
                    error_modal.show(reject);
                })
                .finally(loading_modal.hide)
            
        }
        
        // reset to our default values
        function resetDisplay() {
            if (data.failure < 2) thankyou_modal.show('Thank you for using our garage!', 'Enter Now');
            $timeout(function () {
                data.enter = false;
                data.foundReservation = true;
                data.reservation = {};
                data.failure = 0;
                for (let [key,value] of Object.entries(searchCriteria)) {
                    searchCriteria[key] = '';
                } // reset all of the searchCriteria fields.
                
                thankyou_modal.hide();
            }, 5000); // reset after 5 second delay
        } // TODO: finish thank you message after entering, then reset the display data
        
        function init() {
        
        }
        
        // init the page
        angular.element(document).ready(async function () {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            
            if (params.state == 'exit') {
                $timeout(function () {
                    data.exit = true;
                }, 0);
            }
            
        });
        
        
        return {
            buildAndFind,
            data,
            error_modal,
            exitGarage,
            loading_modal,
            resetDisplay,
            searchCriteria,
            thankyou_modal
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