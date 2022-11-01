(function (window) {
    function priceCtrl($scope, $http, $document, $timeout) {

        const URLS = {
            getGarages: '/garage/getGarages',
            getPricing: '/pricing/getPricing',
            pricing: '/pricing/updatePricing'
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
        
        function editPrice (priceId) {
            let match = _.find(price.options, (p) => p.PRICING_ID == priceId);
    
            if (match) {
                price.currentEdit = _.cloneDeep(match);
                console.dir(price); // debug - remove
                removePriceFromlist(priceId);
            }
        }
        
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
                    console.dir(price); // debug - remove
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
            console.log(price.currentEdit)
            
            console.log('form submitted', {price});
            $http.post(URLS.pricing, {price})
                .then((resp) => {
                    loading_modal.hide();
                    console.log('****', resp);
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
    
        // init the page
        angular.element(document).ready(async function () {
            console.log('init'); // debug - remove
            await getPricing();
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            
            // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
            //let value = params.some_key; // "some_value"
            console.dir(params.user); // debug - remove
            data.operator.set("name", params.user); // set our operator name
            
            console.dir(data); // debug - remove
            
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