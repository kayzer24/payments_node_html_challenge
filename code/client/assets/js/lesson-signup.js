document.addEventListener('DOMContentLoaded', async (e) => {
  const {publishableKey, domain} = await fetch('/config').then((r) => r.json());

  const stripe = Stripe(publishableKey, {
    locale: 'en'
  });

  var elements = stripe.elements();
  var card = elements.create("card", {});
  card.mount(".sr-card-element");

  const submitButton = document.getElementById("submit");
  submitButton.disabled = true;

  let displayError = document.getElementById('card-errors');

  // Element focus ring
  card.on("focus", function() {
    var el = document.querySelector(".sr-card-element");
    el.classList.add("focused");
  });

  card.on("blur", function() {
    var el = document.querySelector(".sr-card-element");
    el.classList.remove("focused");
  });

  // validate card element
  card.on('change', function(event) {
    submitButton.disabled = event.empty;
    displayError.textContent = event.error ? event.error.message : "";
  });

  let declineError = "";

  submitButton.addEventListener('click', async (e) => {
    e.preventDefault();

    changeLoadingState(true);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const selectedItem = document.querySelector('.sr-item.selected');
    let selectedDate = selectedItem.querySelector('.sr-lesson-date').textContent;
    let selectedTime = selectedItem.querySelector('.sr-lesson-time').textContent

    //check email and name are valid and not empty
    if(email === "" || name === "" || !validateEmail(email)){
      if (name === "") {
        displayError.textContent = 'Name should not be blank'
      }else if (email === ""){
        displayError.textContent = 'Email should not be blank.'
      } else if (!validateEmail(email)) {
        displayError.textContent = 'Email is not valid.'
      }

      changeLoadingState(false);
      return;
    }
    
    const customerExists = await getCustomerByEmail(email);

    let customer;
    if (declineError!=="") {
      customer = customerExists;
    } else {
      if (null !== customerExists) {
        showCustomerExistsError(customerExists, domain);
        return;
      }

      customer = await fetch('/customers', {
        method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({name, email, firstLesson: selectedDate + ' ' + selectedTime})
      }).then((r) => r.json());
    }
    
      
      const {intent, error} = await fetch('/lessons', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({customerId: customer.id})
      })
      .then((r) => r.json());

      if (intent) {
        stripe.confirmCardSetup(intent.client_secret, {
          payment_method: {
            card: card,
            billing_details: { 
              email: email, 
              name: name
            }
          },
          expand: ['payment_method']
        }).then((result) => {
          if(result.error){
            displayError.textContent = result.error.message;

            declineError = result.error.code;

            changeLoadingState(false);
          }else {
            declineError = "";
            signupComplete({
              customerId: intent.customer.id, 
              customerEmail: intent.customer.email, 
              last4: result.setupIntent.payment_method.card.last4
            });
          }
        })
        changeLoadingState(false);
      }
    
  })
})


/* --- Functions we expect you will need to modify to complete the solution -- */
/** 
 * Shows the "#customer-exists-error" div when a customer already existis.  
 * To complete: finish this to display the customers email address and a link to their account_update form. 
 */
var showCustomerExistsError = function(customer, domain) {
  var errorMsgDiv = document.querySelector("#customer-exists-error");
  errorMsgDiv.removeAttribute("hidden");
  document.querySelector("#submit").classList.add("hidden");
  errorMsgDiv.removeAttribute("hidden");

  document.getElementById("error_msg_customer_email").innerHTML = customer.email;
  document.getElementById("account_link").innerHTML = `${domain}/account-update/${customer.id}`;
  changeLoadingState(false);
}



/**** ----  Additional helpers. *****/

/* Shows a success / error message when the payment is complete */
var signupComplete = function(json) {
  document.querySelector(".sr-payment-form").classList.add("hidden");
  document.querySelector(".completed-view").classList.remove("hidden");
  setTimeout(function() {
      document.querySelector(".completed-view").classList.add("expand");
    }, 200);
  changeLoadingState(false);
  document.querySelector("#submit").setAttribute("disabled", "disabled");

  if(json) {
    document.getElementById("customer-id").innerHTML = json.customerId;
    document.getElementById("customer_email").innerHTML = json.customerEmail;
    document.getElementById("last4").innerHTML = json.last4;
  }
  
};


/* logic to display available lesson times and toggle the display of the sign up form . */
function appendLeadingZeroes(n){
  if(n <= 9){
    return "0" + n;
  }
  return n
}
const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
let firstSession = new Date();
firstSession.setDate(firstSession.getDate()+9);
let firstSess= appendLeadingZeroes(firstSession.getDate()) + " " + months[firstSession.getMonth()];
let firstDate = `${firstSess} 3:00 p.m.`;
let firstLineItem = `Guitar Lesson request: ${firstDate}`;


let secondSession = new Date();
secondSession.setDate(secondSession.getDate()+14);
let secondSess= appendLeadingZeroes(secondSession.getDate()) + " " + months[secondSession.getMonth()] ;
let secondDate = `${secondSess} 4:00 p.m.`;
let secondLineItem = `Guitar Lesson request: ${secondDate}`;


let thirdSession = new Date();
thirdSession.setDate(thirdSession.getDate()+21);
let thirdSess= appendLeadingZeroes(thirdSession.getDate()) + " " + months[thirdSession.getMonth()];
let thirdDate = `${thirdSess} 5:00 p.m.`;
let thirdLineItem = `Guitar Lesson request: ${thirdDate}`;

const allitems = {
  first : {
    itemId: 'first',
    title: firstDate,
    date: firstSess,
    time: '3:00 p.m.',
  },
  second : {
    itemId: 'second',
    title: secondDate,
    date: secondSess,
    time: '4:00 p.m.',
  },
  third : {
    itemId: 'third',
    title: thirdDate,
    date: thirdSess,
    time: '5:00 p.m.',
  }
};

/** 
 * Generates the HTML for the lesson sign up options 
 */
function generateHtmlForitemsPage(){
  function generateHtmlForSingleitem(id, date, time){
    result = `
        <div class="sr-item" 
        id=\'${id}\'
        onclick="toggleItem(\'${id}\')"
                >
          <div class="sr-lesson-title">
            <div class="sr-lesson-date">${date}</div>
            <br>
            <div class="sr-lesson-time">${time}</div>
          </div>
          <button2 id="${id}">
            <p class="sr-buton-label">Book Now!</p>
          </button>
        </div>
      `;
    return result;
  }
  var html = '';
  Object.values(allitems).forEach((item) => {
    html += generateHtmlForSingleitem(item.itemId, item.date, item.time);
  });

  document.getElementById('sr-items').innerHTML += html;
}

generateHtmlForitemsPage();

/** 
 * Shows the registration form if session is selected. 
 */
var toggleRegForm = function(showRegForm) {
  var formElts = document.querySelectorAll('.sr-form-container');
  if (showRegForm) {
    formElts.forEach(function(elt) {
      elt.classList.remove('hidden');
    });
  } else {
    formElts.forEach(function(elt) {
      elt.classList.add('hidden');
    });
  }  
}

toggleRegForm(false);


let toggleItem = function(id) {
  clear();
  allitems[id].selected = !allitems[id].selected;
  let dateElt = document.getElementById(id);
  let summaryTableItem = document.getElementById(id).textContent;
  if (allitems[id].selected) {
    dateElt.classList.add('selected');
    document.querySelector("#summary-table").innerHTML = `<font>You have requested a lesson for ${summaryTableItem} Please complete the registration form to reserve your lesson.</font>`;
    toggleRegForm(true);
  }
  else {
    dateElt.classList.remove('selected');
    document.querySelector("#summary-table").textContent = "";
    toggleRegForm(false);
  }
  // getSelectedItems();
  allitems[id].selected = !allitems[id].selected;
  // console.log(getSelectedItems());
  let registration = summaryTableItem;
}

let clear = function () {
  let allElt = document.querySelectorAll(".sr-item");
  allElt.forEach (function(elt) {
    elt.classList.remove("selected");
  });
};



// Return a customer or Null
var getCustomerByEmail = async function(email) {  
  const {customers} = await fetch(`/customers/${email}`).then((r) => r.json())

  return customers.length > 0 ? customers[0]: null;
}

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};