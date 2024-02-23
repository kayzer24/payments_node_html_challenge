
var allitems = {};
var minitemsForDiscount;
var discountFactor;

var orderData = {
  items:null, 
  changed:false
};


var getSelecteditems = function() {
  return Object.values(allitems).filter(item => item.selected);
};


/*
 * handle an update to the items selected.  Toggles the payment form.
*/
var onSelectionChanged = function(e) {
  var selecteditems = getSelecteditems();
  orderData['items'] = selecteditems.map(item => item.itemId);

  updateSummaryTable();
  togglePaymentForm();
};


/**
 * Shows the payment form if there are items to purchase.
 */
var togglePaymentForm = function() {
    var selecteditems = getSelecteditems();
    var showPaymentForm = selecteditems.length > 0;
    var paymentFormElts = document.querySelectorAll('.sr-payment-form, .summary-table');
    if (showPaymentForm) {
      document.querySelector(".purchase-section").classList.remove("hidden");
      paymentFormElts.forEach(function(elt) {
        elt.classList.remove('hidden');
      });
    } else {
      document.querySelector(".purchase-section").classList.add("hidden");
      paymentFormElts.forEach(function(elt) {
        elt.classList.add('hidden');
      });
    }  
}

/*
 * Toggles the title of the payment summary form.
 */ 
var toggleSummaryPreface = function (showPreface) {
  preface = '';
  if (showPreface) {
    preface = 'No courses selected.';
  }
  document.getElementById('summary-preface').innerHTML = preface;
}

/*
 * Updates the summary table of videos selected and calculated the total and the discount
 */
var updateSummaryTable = function() {
  var computeSubtotal = function() {
    var selecteditems = getSelecteditems();
    return selecteditems
      .map(item => item.price)
      .reduce((item1, item2) => item1 + item2, 0);
  };

  var computeDiscountPercent = function() {
    var selecteditems = getSelecteditems();
    var eligibleForDiscount = selecteditems.length >= minitemsForDiscount;
    return eligibleForDiscount ? discountFactor : 0;
  };

  var selecteditems = getSelecteditems();
  var discountPercent = computeDiscountPercent();
  var subtotal = computeSubtotal();
  var discount = discountPercent * subtotal;
  var total = subtotal - discount;

  var orderSummary = document.getElementById('summary-table');
  if (orderSummary) {
    var buildOrderSummaryRow = function(rowClass, desc, amountCents) {
        return `
          <div class="${rowClass} summary-title">${capitalize(desc)}</div>
          <div class="${rowClass} summary-price">${getPriceDollars(amountCents)}</div>
        `;
    };
    orderSummary.innerHTML = '';
    
    for (var i = 0; i < selecteditems.length; i++) {
      orderSummary.innerHTML += buildOrderSummaryRow('summary-product', selecteditems[i].title, selecteditems[i].price);
    }
    if (discount>0){
      orderSummary.innerHTML += buildOrderSummaryRow('summary-subtotal', 'Subtotal', subtotal);
      orderSummary.innerHTML += buildOrderSummaryRow('summary-discount', 'Discount', discount);
    }
    orderSummary.innerHTML += buildOrderSummaryRow('summary-total', 'Total', total);
  }

  toggleSummaryPreface(selecteditems.length == 0);
};


function capitalize(name){
  return name.charAt(0).toUpperCase() + name.slice(1);
}


function getPriceDollars(price, recurringBy=undefined) {
  var pricePart = '$' + Math.round(price / 100.0);
  if (recurringBy===undefined){
    return pricePart;
  }
  else{
    return pricePart + '/' + recurringBy;
  }
}

/*
 * getting videos and discount info to load the page.
 */
function init() {
  return fetch('/setup-video-page', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(handleErrors)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      minitemsForDiscount = Number(json.minItemsForDiscount);
      discountFactor = Number(json.discountFactor);
      allitems = json.items; 
      console.log(allitems);
      generateHtmlForitemsPage();
    });
   
}

document.querySelector(".purchase-section").classList.add("hidden");
init();
toggleSummaryPreface(true);
togglePaymentForm();

/* 
 * Generates the HTML for video courses. 
 */
function generateHtmlForitemsPage(){
  function generateHtmlForSingleitem(id, item, price, img, desc){
    result = `
        <div class="sr-item" 
        id=\'${id}\'
        onclick="toggleitem(\'${id}\')"
                >
          <div class="eco-product-img"
            >
            <img src=${img}>
          </div>
          <div class="eco-product-card">
            <div class="sr-item-text">${capitalize(item)}</div>
            <div class="video-desc-container">
              <div class="eco-desc-text">${desc}</div>
            </div>
            <button2 id="${id}">${getPriceDollars(price)}</button>
          </div>
        </div>
      `;
    return result;
  }
  var html = '';
  Object.values(allitems).forEach((item) => {
    html += generateHtmlForSingleitem(item.itemId, item.title, item.price, item.img, item.desc);
  });

  document.getElementById('sr-items').innerHTML += html;
}


function toggleitem(id){
  allitems[id].selected = !allitems[id].selected;
  var productElt = document.getElementById(id);
  if (allitems[id].selected) {
    productElt.classList.add('selected');
  }
  else {
    productElt.classList.remove('selected');
  }
  onSelectionChanged();
}


/* Shows a success / error message when the payment is complete */
var orderComplete = function() {
    document.querySelector(".sr-payment-form").classList.add("hidden");
    document.querySelector(".completed-view").classList.remove("hidden");
    setTimeout(function() {
      document.querySelector(".completed-view").classList.add("expand");
    }, 200);
    changeLoadingState(false);
    document.querySelector("#submit").setAttribute("disabled", "disabled");

};