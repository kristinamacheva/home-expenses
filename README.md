# Home Expenses

## Overview
"Home Expenses" is a web application designed to optimize the calculation and distribution of financial responsibilities among household members. The main problem it addresses is how to manage and allocate household expenses more efficiently, avoiding the need for separate payments for each expense. By calculating each member's share of the expenses and adding the final amount to the household's total balance, the application allows for better organization and control of finances while reducing the risk of missed or duplicate payments.

Benefits of using the app include saving time, avoiding conflicts over upcoming and paid expenses, and improving budget planning. The app offers three different roles: household admin, regular user, and child. The Admin has full control over the household, including the management of households, household members, and expenses. The Regular User can add, edit, and delete the expenses they create. The Child role has limited rights, allowing parents to involve younger household members in managing finances without giving them full access.

## Getting Started

### Installation

To install the necessary dependencies, run:

```
npm install
```

### Environment Variables

You will need to set up a .env file in the server directory of the project. This file should contain the following environment variables:

```
AUTH_ACCESS_TOKEN_SECRET
AUTH_ACCESS_TOKEN_EXPIRY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
MONGODB_URI
```

Fill in the appropriate values for each variable.

### Running the Client

To start the client, use the following command:

```
npm run dev
```

### Running the Server

To start the server, use the following command:

```
npm start
```
## User Roles and Permissions
Unregistered users and those not logged in are restricted to accessing only the login and registration pages. Full access to household features, including management of expenses, payments, and other functionalities, requires a valid user account. Each user can have one of the following three roles in each group they are added to - household admin, regular user or child. Depending on the role, users have different permissions and options to manage households, expenses, expense templates, payments, categories, allowances, wishlist items and reminders.

### Household admin
- An admin can register and create a group, and he must add at least one member to the group.
- An admin can send invitations to users to join the group after creation.
- Each creator of a household group automatically becomes the group admin.
- A group must have one or more admins. An admin can add members, remove members, or edit the roles of other group members. If a member was originally a regular user or admin, their role cannot be changed to a child role.
- When leaving the group, if there are no other admins, the admin must make another household member an admin.
- Can manage all expenses - create, edit or delete unapproved expenses that he or another household member has created.
- Can manage all categories - can create, edit or delete categories that he or another household member has created.
- Can archive a household, with all household information retained. Users cannot create, edit or delete records, or make changes to the household when archived. To successfully archive a household, all balances and allowances need to be 0. Any archived household can be restored by the admins.
- Can perform the same actions as a regular user.

### Regular user
- May approve or reject an invitation to join a group.
- Can edit their profile - change name, email, phone, password and profile picture. The old password must also be entered to successfully edit the profile.
- Can only leave the group if the amount in his balance is 0 and all his debts to other household members have been paid. When leaving the group, all the user's previously available information is retained.
- Can search for expenses by title, category, date and status.
- Each user can create an expense by adding all users who have paid the expense as well as users owing certain amounts for the expense.
- Can choose how to allocate expense payers - only the current user, equally or manually entered amount. The expense creator must be one of the expense payers. The goal is to have the expense created by the household member who paid it. 
- Can choose how the expense is split - equally, by percentage or manually entered amount. The expense must be split between a minimum of two household members.
- If there are children in the household, he can create an expense with an allowance category and must specify the child to whom the allowance will be transferred.
- Each user who participates in the expense must approve or reject it.
- May add comments to the expense to state a reason for rejecting the expense or to discuss or clarify the details of the expense with other household members.
- Each creator of an expense can edit it after all other household members involved in the expense have approved or rejected it.
- When all participants approve the expense, the amounts from the balance of the expense go into the household balance. If the expense is an allowance, the amount is added to the account of the child concerned. Users are not allowed to approve/reject an expense that has already been approved, and the creators of the expense and the group admins are not allowed to edit or delete it.
- Can create an expense template, required fields are template name and total amount. If a splitting method is selected, the participants must also be listed, and their amounts do not need to equal the total amount. 
- Can edit or delete their own templates as well as create an expense using one of their templates.
- Access analysis of approved expenses for a specified time period for the categories to which the expenses belong, trends of expenses over time, and information on the total amount of expenses, their number, and the percentage of uncategorized expenses.
- Has access to the household balance and can repay his debts to other household members with an amount of his choice and a household member he wants to pay. A payment is created, and approval from the recipient is required. Both parties can add comments to the payment.
- Can approve or reject a payment made to him and must give a reason for rejection.
- Must approve or disapprove all payments made to him before he can create or approve an expense.
- Can search for payments by date.
- If there are household members who owe him money, he may send a reminder of amounts owed to one or more of the household members. Reminders can also be sent for unapproved payments and expenses.
- Can create, edit and delete expense categories in each group. When a category is deleted, the expense goes into the uncategorized category. Predefined categories are automatically added to each household and cannot be changed by users.
- Can send messages, images or links to a resource (expense or payment) in the household chat, as well as mention other household members.
- If there are children in the household, he can see the children's current account and the wishlist items they have created. 
- Gets notified when invited to join a group, when new members join the group, when a member leaves the group, and when a user's role changes.
- Receives notifications of the creation of a new expense that must be approved or rejected.
- Receives notification of a payment created or approved. 
- Receives a notification when the group balance changes when an expense is approved.
- Receives notification when mentioned in chat.

### Child
- Each child has his or her own account, with amounts coming into the account as a result of approved allowance expenses paid by one or more household members.
- This type of user cannot create, edit, or participate in household spending.
- Receives notification when a new amount is added to the account.
- Can create own expenses that are not included in household expenses, but kept separate for each child. When the expense is created, his or her allowance account is reduced by the appropriate amount.
- When creating an expense, there is a limit on the maximum amount - it must not exceed the amount each child has in their own account.
- Can search for expenses by title and date.
- Can create a wishlist item, and when the wish is purchased, an expense is created with the corresponding wish amount. For each wishlist item, information is displayed on whether or not it has been purchased, and whether and how much is not enough for the wish. 
- Can edit or delete wishlist items.
- Can search for wishlist items by title and purchase status.
