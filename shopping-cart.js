// JS Shopping Cart
// v1.0
// (c) 2016 Jet Code
// 4-1-2016


var makeCart = function() {

'use strict';

// The cart's state is protected inside a closure.
var items = [];
var numItems = 0;
var subtotal = 0;
var taxRate = 0;
var taxCost = 0;
var shippingType = 0;
var shippingCost = 0;
var discount = 0;
var totalCost = 0;
var paymentType = 0;

// utility function
var checkCart = function(name, items) {
    var i;
    for (i=0; i<items.length; i++) {
        if (items[i].name === name) {
            return i; // index of product
        }    
    }
    return -1; // match for product name not found
};

// return object with public methods
return {

    addItem: function(name, productID, price, quantity, weight, size) {
        
        var index = checkCart(name, items);

        if (index === -1) {
        
            var item = {
                name: name,
                ID: productID,
                price: ((price >= 0) ? price : 0),
                quantity: ((quantity >= 0) ? quantity : 0),
                weight: weight || 0,
                size: size || 0
            };
            
            items.push(item);
            numItems += quantity;
        }
        else {
            numItems += quantity;
            items[index].quantity += quantity;
        }
    },
    
    updateItem: function(name, quantity) {
        
        var index = checkCart(name, items);
        if (index === -1) {
            console.log('Error: Item not found in cart!');
        }
        else {
            if (quantity > 0) {
                numItems = numItems - items[index].quantity + quantity;
                items[index].quantity = quantity;
            }
            else if (quantity === 0) {
                numItems = numItems - items[index].quantity;
                items.splice(index,1); // delete item
            }
            else {
                console.log('Error: Quantity must be a positive value!');
            }
        }
    },
    
    deleteItem: function(name) {
        
        var index = checkCart(name, items);
        if (index === -1) {
            console.log('Error: Item not found in cart!');
        }
        else {
            numItems -= items[index].quantity;
            items.splice(index,1);
        }
    },
    
    emptyCart: function() {
        
        items = [];
        numItems = 0;
        subtotal = 0;
        taxRate = 0;
        taxCost = 0;
        shippingType = 0;
        shippingCost = 0;
        discount = 0;
        totalCost = 0;
        paymentType = 0;
        
    },
    
    setShippingType: function(shipType) {
        
        if (typeof shipType === 'string') {
            shippingType = shipType;
            // shippingCost is function of shippingType
        }
        else {
            console.log('Error: Shipping must be >= 0 and type must be a string!');
        }
    },
    
    calcCosts: function() {
        
        var i;
        var tempCost = 0;
        subtotal = 0;
        
        for (i=0; i<items.length; i++) {
            // scale before doing arithmetic to avoid floating point errors from IEEE 754 math
            tempCost = items[i].quantity * 100 * items[i].price;
            subtotal += tempCost;
        }
        
        taxCost = (subtotal*100*taxRate);
        totalCost = (100*subtotal + (taxCost/100) + 10000*shippingCost)/10000;
        subtotal = subtotal/100;
        taxCost = taxCost/1000000;
    },
    
    // get methods to access the cart's state
    getItems: function() {
        var itemsCopy = [];
        var item;
        var i;
        
        for (i=0; i<items.length; i++) {
            item = {};
            
            item.name = items[i].name;
            item.ID = items[i].ID;
            item.price = items[i].price;
            item.quantity = items[i].quantity;
            item.weight = items[i].weight;
            item.size = items[i].size;
            
            itemsCopy.push(item);
        }
        return itemsCopy;
    },
    
    getNumItems: function() {
        var numItemsCopy = numItems.toString();
        return numItemsCopy;
    },
    
    getSubtotal: function() {
        var subtotalCopy = subtotal.toFixed(2);
        return subtotalCopy;
    },
    
    getTaxRate: function() {
        var taxCopy = taxRate.toString();
        return taxCopy;
    },
    
    getTaxCost: function() {
        var taxCopy = taxCost.toFixed(2);
        return taxCopy;
    },
    
    getShippingType: function() {
        var shippingCopy = shippingType.toString();
        return shippingCopy;
    },
    
    getShippingCost: function() {
        var shippingCopy = shippingCost.toFixed(2);
        return shippingCopy;
    },
    
    getDiscount: function() {
        var discountCopy = discount.toFixed(2);
        return discountCopy;
    },
    
    getTotalCost: function() {
        var totalCopy = totalCost.toFixed(2);
        return totalCopy;
    },
    
    getPaymentType: function() {
        var payTypeCopy = paymentType.toString();
        return payTypeCopy;
    },
    
    // Checkout
    
    checkout: function(payType, paypalOptions) {
    // uses jQuery, tested with v2
    // selector is from HTML tags
    // paypalOptions is an array of objects with options for the form
    
    var form; // jQuery object from HTML form
    var makeFormInput; // function defined below
    var i;
    var x;
    
    if ((payType !== 'undefined') && (typeof payType === 'string')) {
        paymentType = payType;
    }
    else {
        console.log("Error: No paymentType argument or not of type string");
        return -1;
    }
    
    // assign HTML form selector to jQuery object
    form = $('<form/></form>');
    
    makeFormInput = function(type, name, value) {
        
        var input = $('<input>');
        
        if ((typeof type === 'string') && (typeof name === 'string') && (typeof value === 'string')) {
            
            input.attr('value', value);
            input.attr('name', name);
            input.attr('type', type);
            return input;
        }
    };
    
    form.attr('action', 'https://www.paypal.com/cgi-bin/webscr');
    form.attr('method', 'post');
    
    // add Paypal options to form
    if (paypalOptions !== undefined) {
        for (i=0; i < paypalOptions.length; i++) {
            form.append(makeFormInput(
                paypalOptions[i].type, 
                paypalOptions[i].name, 
                paypalOptions[i].value
            ));
        }
    }
    else {
        console.log("Error: paypalOptions array is missing");
        return -1;
    }
    
    // add items from shopping cart
    for (i=0; i < items.length; i++) {
        
        x = i + 1;
        
        form.append(makeFormInput('hidden', 'item_name_' + x.toString(), items[i].name));
        form.append(makeFormInput('hidden', 'item_number_' + x.toString(), items[i].ID.toString()));
        form.append(makeFormInput('hidden', 'amount_' + x.toString(), items[i].price.toFixed(2)));
        form.append(makeFormInput('hidden', 'quantity_' + x.toString(), items[i].quantity.toString()));
    }
    
    // add tax
    form.append(makeFormInput('hidden', 'tax', taxCost.toFixed(2)));
    $('body').append(form);
    form.submit();
    form.remove();
    }

}; // end return object     
}; // end constructor function








