# Milestone 4: Accounting reports

This is the milestone before Townsend Music Shop is back in business, we're almost done. After you finish this Milestone, look out for a GitHub Issue with info about how to complete this engagement.

Back when our business was cash-only, our accountant regularly told us that our record keeping left a lot to be desired. In particular, they couldn't believe that we didn't have up-to-date numbers on revenue and delinquent payments. They insisted that maintaining accurate metrics would let us:

- Forecast our income more accurately
- Verify we're paying every team member appropriately
- Collect on more of our outstanding lesson payments

Now that we're starting back up, we and our accountant both want to make sure the business is built on a solid foundation.

## Requirements

We need your help implementing API endpoints to answer each of these questions:

1. How much total revenue we're making from lessons
2. Which students had failed to pay for their most recent lesson

## Total earned from lessons

We plan to start looking at this number first thing every Monday morning.

Complete the `GET /calculate-lesson-total` endpoint to return the total amount of money the store has netted from lessons, minus any Stripe processing fees or refund costs, including refunds because of disputes. Only count lesson related transactions starting from the last week — that is, if today is the 10th, include everything from the 3rd to now.

The endpoint doesn't accept any parameters.

It returns the total revenue, processing costs, and net revenue — all in cents to avoid errors from floating point logic.

_Townsend Music Shop could use the Financial Reports in Stripe's Dashboard to download an itemized list of transactions which include the relevant tag, but this endpoint lets them instantly get a rolling total._

_The account we're testing with has a high volume of test payments, make sure you are retrieving every transaction from the last week._

## Find customers with bad payment methods

We're going to start emailing our students whose cards we couldn't authorize, asking them to plug in a new payment method.

Complete the `GET /find-customers-with-failed-payments` endpoint to return a list of customers who meet the following two requirements:

1. The last payment associated with them didn't succeed. Same as above, only check the last week of payments.
2. The payment method on file for them matches the payment method used for the failed payment attempt. In other words, don't include customers who previously failed but have now updated their payment method.

The endpoint doesn't accept any parameters.

It returns an object where:

- The keys are the IDs of Customers with failed payments
- The values include key details about the failed payment, the customer, and their saved payment method.
