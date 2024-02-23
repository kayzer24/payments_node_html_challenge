/* eslint-disable no-console */
const express = require('express');

const app = express();
const { resolve } = require('path');
// Replace if using a different env file or config
require('dotenv').config({ path: './.env' });
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const allitems = {};

// const MIN_ITEMS_FOR_DISCOUNT = 2;
app.use(express.static(process.env.STATIC_DIR));

app.use(
  express.json(
    {
      // Should use middleware or a function to compute it only when
      // hitting the Stripe webhook endpoint.
      verify: (req, res, buf) => {
        if (req.originalUrl.startsWith('/webhook')) {
          req.rawBody = buf.toString();
        }
      },
    },
  ),
);
app.use(cors({ origin: true }));

// load config file
const fs = require('fs');

const configFile = fs.readFileSync('../config.json');
const config = JSON.parse(configFile);

// load items file for video courses
const file = require('../items.json');
const { json } = require('body-parser');

file.forEach((item) => {
  const initializedItem = item;
  initializedItem.selected = false;
  allitems[item.itemId] = initializedItem;
});


// const asyncMiddleware = fn => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// Routes
app.get('/', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/index.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

app.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    domain: process.env.DOMAIN
  });
});

app.get('/concert', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/concert.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});


app.get('/setup-concert-page', (req, res) => {
  res.send({
    basePrice: config.checkout_base_price,
    currency: config.checkout_currency,
  });
});

// Show success page, after user buy concert tickets
app.get('/concert-success', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/concert-success.html`);
    console.log(path);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

app.get('/videos', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/videos.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

app.get('/setup-video-page', (req, res) => {
  res.send({
    discountFactor: config.video_discount_factor,
    minItemsForDiscount: config.video_min_items_for_discount,
    items: allitems,
  });
});

// Milestone 1: Signing up
// Shows the lesson sign up page.
app.get('/lessons', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/lessons.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

app.get('/customers/:email',async (req, res) => {
  const email = req.params.email;

  let customers = await stripe.customers.list({email:email});

  res.send({customers: customers.data});
})

app.post('/lessons', async(req, res) => {
  const {customerId} = req.body;

  try {

    let setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      expand: ['customer']
    })

    res.send({intent: setupIntent});

  } catch(err) {
    res.status(400).send({error: { message: err.message }});
  }
});

app.post('/customers', async (req, res) => {
  const {name, email, firstLesson}= req.body;
  
  res.send(await stripe.customers.create({
    email:email,
    name: name,
    metadata: {
      first_lesson: firstLesson
    }
  }));
})
// Milestone 2: '/schedule-lesson'
// Authorize a payment for a lesson
//
// Parameters:
// customer_id: id of the customer
// amount: amount of the lesson in cents
// description: a description of this lesson
//
// Example call:
// curl -X POST http://localhost:4242/schdeule-lesson \
//  -d customer_id=cus_GlY8vzEaWTFmps \
//  -d amount=4500 \
//  -d description='Lesson on Feb 25th'
//
// Returns: a JSON response of one of the following forms:
// For a successful payment, return the Payment Intent:
//   {
//        payment: <payment_intent>
//    }
//
// For errors:
//  {
//    error:
//       code: the code returned from the Stripe error if there was one
//       message: the message returned from the Stripe error. if no payment method was
//         found for that customer return an msg 'no payment methods found for <customer_id>'
//    payment_intent_id: if a payment intent was created but not successfully authorized
// }
app.post('/schedule-lesson', async (req, res) => {
  const {customer_id, amount, description} = req.body;

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer_id,
      type: 'card',
    });

    const intent = await stripe.paymentIntents.create({
      customer: customer_id,
      payment_method: paymentMethods.data[0].id,
      currency: 'usd',
      amount: amount,
      description: description,
      metadata: {
        type: 'lessons-payment'
      },
      payment_method_types: ['card'],
      capture_method: 'manual',
      off_session: true,
      confirm: true,
    });

    res.send({payment: intent});
  } catch(err) {
    res.status(400).send({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
});


// Milestone 2: '/complete-lesson-payment'
// Capture a payment for a lesson.
//
// Parameters:
// amount: (optional) amount to capture if different than the original amount authorized
//
// Example call:
// curl -X POST http://localhost:4242/complete_lesson_payment \
//  -d payment_intent_id=pi_XXX \
//  -d amount=4500
//
// Returns: a JSON response of one of the following forms:
//
// For a successful payment, return the payment intent:
//   {
//        payment: <payment_intent>
//    }
//
// for errors:
//  {
//    error:
//       code: the code returned from the error
//       message: the message returned from the error from Stripe
// }
//
app.post('/complete-lesson-payment', async (req, res) => {
  const {payment_intent_id, amount}= req.body

  try {
    const intent = await stripe.paymentIntents.capture(payment_intent_id, {
      amount_to_capture: amount
    });

    res.send({payment: intent});
  } catch(err) {
    res.status(400).send({error: {code: err.code, message: err.message}});
  }
});

// Milestone 2: '/refund-lesson'
// Refunds a lesson payment.  Refund the payment from the customer (or cancel the auth
// if a payment hasn't occurred).
// Sets the refund reason to 'requested_by_customer'
//
// Parameters:
// payment_intent_id: the payment intent to refund
// amount: (optional) amount to refund if different than the original payment
//
// Example call:
// curl -X POST http://localhost:4242/refund-lesson \
//   -d payment_intent_id=pi_XXX \
//   -d amount=2500
//
// Returns
// If the refund is successfully created returns a JSON response of the format:
//
// {
//   refund: refund.id
// }
//
// If there was an error:
//  {
//    error: {
//        code: e.error.code,
//        message: e.error.message
//      }
//  }
app.post('/refund-lesson', async (req, res) => {
  const {payment_intent_id, amount} = req.body;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: amount
    });

    res.send({refund: refund.id})
  } catch(err) {
    res.status(400).send({error: {code: err.code, message: err.message}});
  }
});

// Milestone 3: Managing account info
// Displays the account update page for a given customer
app.set('views', resolve(process.env.STATIC_DIR))
app.set('view engine', 'ejs');

app.get('/account-update/:customer_id', async (req, res) => {

  const customerId = req.params.customer_id;

  try {
    const customer = await stripe.customers.retrieve(customerId);

    const paymentMethods = await stripe.customers.listPaymentMethods(
      customerId,
      {type: 'card'}
    );
    
    res.render('account-update', {customer: customer, paymentMethod: paymentMethods.data[0]});
  } catch (err) {
    res.status(400).send({error: {message: err.message}})
  }
});

app.post('/account-update/:customer_id', async (req, res) => {
  const {customerId, customerEmail, customerName, paymentMethodId, setupIntentStatus} = req.body;

  try {
    if(typeof setupIntentStatus !== 'undefined' && setupIntentStatus === "succeeded") {
      const customer = await stripe.customers.update(
        customerId,
        {name: customerName, email: customerEmail}
      );

      const paymentMethod = await stripe.paymentMethods.detach(
        paymentMethodId
      );

      res.send({response: 'Account updated successfuly'})
    } else {
        let setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session',
        expand: ['customer']
      })

      res.send({intent: setupIntent});
    }
  }catch(err) {
    res.send({error: {code: err.code, message: err.message}});
  }
});
// Milestone 3: '/delete-account'
// Deletes a customer object if there are no uncaptured payment intents for them.
//
// Parameters:
//   customer_id: the id of the customer to delete
//
// Example request
//   curl -X POST http://localhost:4242/delete-account/:customer_id \
//
// Returns 1 of 3 responses:
// If the customer had no uncaptured charges and was successfully deleted returns the response:
//   {
//        deleted: true
//   }
//
// If the customer had uncaptured payment intents, return a list of the payment intent ids:
//   {
//     uncaptured_payments: ids of any uncaptured payment intents
//   }
//
// If there was an error:
//  {
//    error: {
//        code: e.error.code,
//        message: e.error.message
//      }
//  }
//

app.post('/delete-account/:customer_id', async (req, res) => {
  const customer_id = req.params.customer_id;

  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customer_id,
    });

    let uncaptured_payments = [];
    paymentIntents.data.forEach((payment) => {
      if (payment.amount_capturable > 0) {
        uncaptured_payments.push(payment.id);
      }
    });

    if (uncaptured_payments.length > 0) {
      res.send({uncaptured_payments: uncaptured_payments})
    } else {
      const deletedCustomer = await stripe.customers.del(customer_id);
       res.send({deleted: deletedCustomer.deleted})
    }
    
  }catch(err) {
    res.status(400).send({error: {code: err.code, message: err.message}});
  }
});


// Milestone 4: '/calculate-lesson-total'
// Returns the total amounts for payments for lessons, ignoring payments
// for videos and concert tickets.
//
// Example call: curl -X GET http://localhost:4242/calculate-lesson-total
//
// Returns a JSON response of the format:
// {
//      payment_total: total before fees and refunds (including disputes), and excluding payments
//         that haven't yet been captured.
//         This should be equivalent to net + fee totals.
//      fee_total: total amount in fees that the store has paid to Stripe
//      net_total: net amount the store has earned from the payments.
// }
//
app.get('/calculate-lesson-total', async (req, res) => {
  try {
    const now = new Date();
    const lastWeekDate = (new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 1)).getTime() / 1000;

    console.log(lastWeekDate)

    const charges = await stripe.charges.list({
      limit: 100,
      created: {gte: lastWeekDate},
      expand: ['data.balance_transaction']
    });

    let paymentTotal = 0 
    let feeTotal = 0
    let netTotal = 0

    charges.data.forEach((charge) => {
      if (charge.balance_transaction) {
        paymentTotal += charge.balance_transaction.amount;
        netTotal += charge.balance_transaction.net;
        feeTotal += charge.balance_transaction.fee;
      }
    });

    res.send({
      payment_total: paymentTotal,
      fee_total: feeTotal,
      net_total: netTotal
    });
  } catch (err) {
    res.send({error: { code: err.code, message: err.message}})
  }
});


// Milestone 4: '/find-customers-with-failed-payments'
// Returns any customer who meets the following conditions:
// The last attempt to make a payment for that customer failed.
// The payment method associated with that customer is the same payment method used
// for the failed payment, in other words, the customer has not yet supplied a new payment method.
//
// Example request: curl -X GET http://localhost:4242/find-customers-with-failed-payments
//
// Returns a JSON response with information about each customer identified and
// their associated last payment
// attempt and, info about the payment method on file.
// [
//   <customer_id>: {
//     customer: {
//       email: customer.email,
//       name: customer.name,
//     },
//     payment_intent: {
//       created: created timestamp for the payment intent
//       description: description from the payment intent
//       status: the status of the payment intent
//       error: the error returned from the payment attempt
//     },
//     payment_method: {
//       last4: last four of the card stored on the customer
//       brand: brand of the card stored on the customer
//     }
//   },
//   <customer_id>: {},
//   <customer_id>: {},
// ]
app.get('/find-customers-with-failed-payments', async (req, res) => {
  const now = new Date();
  const lastWeekDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  const customersArray = [];

  try {
    const {data: charges} = await stripe.charges.list({
      limit: 100,
      created: {gte: lastWeekDate},
      expand: ['data.payment_intent']
    });

    for (const charge of charges) {
      if (charge.status == 'failed') {
        let jsonData = {};

        const {data: paymentMethods} = await stripe.customers.listPaymentMethods(charge.customer, {
              type: 'card',
              limit: 1,
              expand: ['data.customer']
        });

        for (const pm of paymentMethods) {
          if(charge.payment_method == pm.id) {
            jsonData[pm.customer.id]= {
              customer: { name: pm.customer.name, email: pm.customer.email},
              payment_intent: {created: charge.created, description: charge.payment_intent.description, status: charge.status , error: charge.outcome.type},
              payment_method: {last4: pm.card.last4, brand: pm.card.brand }
            };
          }
        };

        customersArray.push(jsonData);
      }
    };

    res.send(customersArray);
  }catch (err) {
    res.status(400).send({error: {code: err.code, message: err.message}})
  }
});

function errorHandler(err, req, res, next) {
  res.status(500).send({ error: { message: err.message } });
}

app.use(errorHandler);

app.listen(4242, () => console.log(`Node server listening on port http://localhost:${4242}`));
