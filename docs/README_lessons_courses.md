# Milestone 1: Signing up

We want to start charging our music students online. 

While music lessons are often sold as month-to-month subscriptions, I want to appeal to busy adults who can't commit to weekly lessons.  Students need to save a credit card and pick a first lesson time, but we want to wait until the lesson is sooner to charge them.  

For now, only focus on letting them set up an account and pick their first lesson time.
## Requirements

Complete the Lessons page and implement a `POST /lessons` endpoint for signing up the student.  Our designer prepared some mockups, click to expand:
<details>
<summary>Lesson signup process</summary>

![Lesson Sign Up - Overview](../blob/master/screenshots/LessonSignup-Overview.gif?raw=true)

![Lesson Sign Up - Success](../blob/master/screenshots/LessonSignUp-Success.png?raw=true)

</details>

<details><summary>Error on signing up for multiple lessons.</summary> 

![Lesson Sign Up - Fail](../blob/master/screenshots/LessonSignUp-Fail.png?raw=true) 

</details>

<br />

Require the student to provide their account information, a credit card, and an initial lesson time.  Use a Setup Intent to get authorization for future payments.  We don't want to put a hold on the card yet, as the lessons can be more than 7 days away.
- After the student successfully signs up for a lesson, complete the message in the `id="signup-status"` div to show the new customer id and the last 4 digits of their card.
- Make sure you have only one Customer object per email address.  If a student tries to sign up again with the same email address, have the app show them the included error message and provide them with a link to the `account-update` page where they can update their payment information.
- Save the provided name and email address on the billing details for both the Customer and the Payment Method.  Make sure the Customer only ever has one saved payment method.
- Add a metadata field to the Customer named `first_lesson` which is set to the lesson date and time they select.  We'll use this later to determine when to make the first payment.

_While a real application would have its own customer database which stores a reference to the Stripe Customer ID, you can use the Customer object IDs throughout this challenge._