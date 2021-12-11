# eShop
## A backend project built using Node.js
### Dependanncies[https://github.com/khairnarsaurabh23/eShop/blob/main/package.json]


## Routes:
1. Home
It's a un-protected route means anybody can visit it.
>localhost:4000/api/v1/

2. User Routes
- Un-protected routes
>localhost:4000/api/v1/signup
>localhost:4000/api/v1/login
>localhost:4000/api/v1/logout
>localhost:4000/api/v1/forgotpassword
>localhost:4000/api/v1/password/reset/:token

- Protected routes only to logged in users
These routes are protected by `userMiddleware`[https://github.com/khairnarsaurabh23/eShop/blob/main/middlewares/user.js] middleware
>localhost:4000/api/v1/dashboard
>localhost:4000/api/v1/user/changepassword
>localhost:4000/api/v1/user/update

- Admin specific routes
These routes are protected by `userRole`[https://github.com/khairnarsaurabh23/eShop/blob/main/middlewares/user.js] middleware
>localhost:4000/api/v1/admin/users
>localhost:4000/api/v1/user/:id
Last admin route has Get, Put, Delete Http methods associated with it. So depending on request it'll perform its specific action.

3. Product Routes
- Review Routes
>localhost:4000/api/v1/review
This Route has Post(add review) and Delete(delete review) methods associated with it. Hence depending upon Http request it'll perform its action.

- Admin Specific Routes
>localhost:4000/api/v1/admin/addproduct
>localhost:4000/api/v1/admin/update/:id
Last admin route has Http Put and Delete methods associated with it.

4. Payment routes
- Get routes
>localhost:4000/api/v1/stripekey
>localhost:4000/api/v1/razorpaykey
These routes will get the public key to proceed with payment.

- Make payment route
>localhost:4000/api/v1/payment/stripe
>localhost:4000/api/v1/payment/rezorpay
- The route to make a payment using gateway 

5. Order routes
>localhost:4000/api/v1/order
>localhost:4000/api/v1/user/order
>localhost:4000/api/v1/:id
Second route will get all orders of current user.
Last route well get a specific order using its id.
