(function (window) {
    function priceCtrl($scope, $http, $document, $timeout) {

        const URLS = {
            addGarage: '/garage/add',
            getGarages: '/garage/getGarages',
            getPricing: '/pricing/getPricing',
            pricing: '/pricing/updatePricing',
            updateGarage: '/garage/udpateGarage'
        };
        
        const data = {
            operator: new Map()
        }
        
        const garages = {
            currentEdit: {},
            list: []
        }

        const price = {
            currentEdit: {},
            singleRes: 'single',
            singleCost: '',
            guaranteedRes: 'guaranteed',
            guaranteedCost: '',
            walkInRes: 'walkIn',
            walkInCost: '',
            dailyMax: '',
            options: []
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
        
        function editGarage (garageId) {
            let match = _.find(garages.list, (g) => g.GARAGE_ID == garageId);
            
            if (match) {
                garages.currentEdit = _.cloneDeep(match);
                removeGarageFromlist(garageId);
            }
            
        }
        /*
            Finds the current price for editing.
            
            Removes from the row in the table.
            
            Takes removed value and places into the input boxes for editing.
         */
        function editPrice (priceId) {
            let match = _.find(price.options, (p) => p.PRICING_ID == priceId);
            if (match) {
                price.currentEdit = _.cloneDeep(match);
                removePriceFromlist(priceId);
            }
        }
        
        /*
            Gets the current list of garages.
         */
        async function getGarages () {
            loading_modal.show(); // show our loading icon
            $http.post(URLS.getGarages, {  })
                .then((resp) => {
                    loading_modal.hide();
                    garages.list = _.orderBy(resp.data, ["GARAGE_ID"], ["asc"]) || [];
                }, (reject) => {
                    loading_modal.hide();
                    error_modal.show(reject);
                });
        }
        
        /*
            Fetch all the pricing models for the types of reservations.
         */
        async function getPricing() {
            loading_modal.show(); // show our loading icon
            $http.get(URLS.getPricing, {  })
                .then((resp) => {
                    loading_modal.hide();
                    price.options = resp.data || [];
                    for (let p of price.options) {
                        if (p.DESCRIPTION === 'single') price.singleCost = p.COST;
                        if (p.DESCRIPTION === 'guaranteed') price.guaranteedCost = p.COST;
                        if (p.DESCRIPTION === 'walkIn') price.walkInCost = p.COST;
                    }
                    price.dailyMax = price.options[0].DAILY_MAX;
                }, (reject) => {
                    loading_modal.hide();
                    error_modal.show(reject);
                });
        }
        
        /*
            Save our price edit and readd to our options
            
            Reset our currentEdit price back to empty since it has been saved.
            
            Reorder the list by id
         */
        function savePriceEdit () {
            let p = price.currentEdit;
            if (p.DESCRIPTION === 'single') price.singleCost = p.COST;
            if (p.DESCRIPTION === 'guaranteed') price.guaranteedCost = p.COST;
            if (p.DESCRIPTION === 'walkIn') price.walkInCost = p.COST;
            
            let saved_price = _.cloneDeep(price.currentEdit);
            
            price.options.push(saved_price);
            price.options = _.orderBy(price.options, ["PRICING_ID"], ["asc"])
            
            for (let prop in price.currentEdit) {
                price.currentEdit[prop] = '';
            }
        }

        let loading = 0;

        function submitPriceUpdate() {
            loading_modal.show(); // show our loading icon
            $http.post(URLS.pricing, {price})
                .then((resp) => {
                    loading_modal.hide();
                }, (reject) => {
                    error_modal.show(reject);
                })
    
            loading_modal.hide();
        }
        
        function removeGarageFromlist (garageId) {
            _.remove(garages.list, (g) => g.GARAGE_ID == garageId);
            $(`#${garageId}`).remove();
        }
    
        function removePriceFromlist (pricingId) {
            _.remove(price.options, (p) => p.PRICING_ID == pricingId);
            $(`#price-${pricingId}`).remove();
        }
        
       async function updateGarage () {
            loading_modal.show(); // show our loading icon
            let garage = {
                id: garages?.currentEdit?.id || null,
                description: garages.currentEdit.DESCRIPTION,
                overbookRate: garages.currentEdit.OVERBOOK_RATE,
                numFloors: garages.currentEdit.FLOOR_COUNT,
                spotsPerFloor: garages.currentEdit.spotsPerFloor,
                location: [garages.currentEdit.LAT, garages.currentEdit.LONG],
                isActive: garages.currentEdit.IS_ACTIVE,
            }
            
            
            $http.post(URLS.updateGarage, garage)
                .then(async (resp) => {
                    for (let prop in garages.currentEdit) {
                        garages.currentEdit[prop] = '';
                    }
                    garages.list.push(resp.data);
                    garages.list = _.orderBy(garages.list, ["GARAGE_ID"], ["asc"])
                    loading_modal.hide();
                }, (reject) => {
                    loading_modal.hide();
                    error_modal.show(reject);
                })
                .finally(loading_modal.hide)
        }
    
        // init the page
        angular.element(document).ready(async function () {
            await getPricing();
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            
            // TODO: use JStoken to verify if user looking at this page is an admin
            // force user to leave page if they are not coming there through the login page.
            if (!params.user) {
                window.location.href = "http://localhost:3500/view/not-found"
            }
            
            // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
            //let value = params.some_key; // "some_value"
            data.operator.set("name", params.user); // set our operator name
            
            await getGarages();
            
            loading_modal.hide(); // make sure no modals are showing
            
        });
        
        return {
            data,
            editPrice,
            editGarage,
            error_modal,
            garages,
            loading,
            savePriceEdit,
            submitPriceUpdate,
            price,
            updateGarage
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