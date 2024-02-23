
/** Common helpers used on multiple pages */ 


// handle the situation where fetch doesn't retun an ok status code, for example if the server 500s 
function handleErrors(response) {
  if (!response.ok)
  {
    throw Error(response.statusText)
  }
  return response;
}

// Toggles a spinner. 
var changeLoadingState = function(isLoading) {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};

//display an error message in the card errors section on a page
var displayError = function(errorMsg) {
  console.log("handle the error");
  changeLoadingState(false);
  var errorMsgField = document.querySelector("#card-errors");
  errorMsgField.textContent = errorMsg;
  setTimeout(function() {
    errorMsgField.textContent = "";
  }, 4000);
}

