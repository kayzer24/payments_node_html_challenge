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
  let eventComplete=false;
  card.on('change', function(event) {
    eventComplete=event.complete;
    submitButton.disabled = !event.complete;
    displayError.textContent = event.error ? event.error.message : "";
  });

  document.querySelector('.sr-combo-inputs').addEventListener('keyup', (e) => {
      if (e.target.value === "" ||  (e.target.id == 'email' && !validateEmail(e.target.value))) {
        submitButton.disabled = true
      } else {
        displayError.textContent= '';
        submitButton.disabled = false;
      }
  })

 let declineError = "";

  submitButton.addEventListener('click', async (e) => {
    e.preventDefault();

    changeLoadingState(true);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const customerId = document.getElementById('customer_id').value;
    const paymentMethodId = document.getElementById('account-information').dataset.paymentMethod;

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


    if (null !== customerExists && customerExists.id !== customerId) { 
      showCustomerExistsError(customerExists, domain);
      return;
    }
    

    const {intent, intentError: error} = await fetch(`/account-update/${customerId}`, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({customerId})
    })
    .then((r) => r.json());

    if (intent) {
      const {setupIntent, error} = await stripe.confirmCardSetup(intent.client_secret, {
        payment_method: {
          card: card,
          billing_details: { 
            email: email, 
            name: name
          }
        },
        expand: ['payment_method']
      });
        
      if(error){
          
          displayError.textContent = error.message;
          declineError = error.code;
          changeLoadingState(false);
      }else {
        await fetch(`/account-update/${customerId}`, {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({customerId, email, name, paymentMethodId, setupIntentStatus: setupIntent.status})
        }).then((r) => r.json());
        declineError = "";
        updateComplete({
          id: setupIntent.payment_method.id,
          email: setupIntent.payment_method.billing_details.email, 
          exp_month: setupIntent.payment_method.card.exp_month, 
          exp_year: setupIntent.payment_method.card.exp_year,
          last4: setupIntent.payment_method.card.last4
        });
        
      }
      changeLoadingState(false);
    }
    
  });
})

/**
 * Shows the "#completed-view" div after a customer updates their card.
 * To complete: finish this to display the customers card information showing within the
 * #account-information div.
 */
const updateComplete = function(json) {
  document.querySelector(".sr-payment-form").classList.add("hidden");
  document.querySelector(".completed-view").classList.remove("hidden");
  setTimeout(function() {
      document.querySelector(".completed-view").classList.add("expand");
    }, 200);
  changeLoadingState(false);
  document.querySelector("#submit").setAttribute("disabled", "disabled");

  if(json) {
    document.getElementById('account-information').dataset.paymentMethod = json.id
    document.getElementById("billing-email").innerHTML = json.email;
    document.getElementById("card-exp-month").innerHTML = json.exp_month;
    document.getElementById("card-exp-year").innerHTML = json.exp_year;
    document.getElementById("card-last4").innerHTML = json.last4;
  }
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

/* --- Functions we expect you will need to modify to complete the solution -- */
/** 
 * Shows the "#customer-exists-error" div when a customer already existis.  
 * To complete: finish this to display the customers email address and a link to their account_update form. 
 */
 var showCustomerExistsError = function(customer, domain) {
  var errorMsgDiv = document.querySelector("#customer-exists-error");
  errorMsgDiv.removeAttribute("hidden");
  errorMsgDiv.textContent =  "Customer email already exists"
  changeLoadingState(false);
  document.querySelector("#submit").disabled = false;
}


async  function updateCustomerDetails (customerId, customerEmail, customerName, paymentMethodId) {
 await fetch(`/account-update/${customerId}`, {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({customerId})
  })
  .then((r) => r.json());
}