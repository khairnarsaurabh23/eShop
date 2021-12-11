# eShop
## A backend project built using Node.js
>This is E-com web Store project. This project has all basic functionalities 
>like login, logout, forgot/reset password, order a product, make payment using
>gateways etc. The project uses Jsw web tokens for login releted functionalities.
### [Dependanncies](https://github.com/khairnarsaurabh23/eShop/blob/main/package.json)

##Tools 
- Testing : Postman 9.4.1

<hr>
## Routes:
### Home
It's a un-protected route means anybody can visit it.
>localhost:4000/api/v1/<br>

### User Routes
1. Un-protected routes
>localhost:4000/api/v1/signup<br>
>localhost:4000/api/v1/login<br>
>localhost:4000/api/v1/logout<br>
>localhost:4000/api/v1/forgotpassword<br>
>localhost:4000/api/v1/password/reset/:token<br>

2. Protected routes only to logged in users
- These routes are protected by [`userMiddleware`](https://github.com/khairnarsaurabh23/eShop/blob/main/middlewares/user.js) middleware
>localhost:4000/api/v1/dashboard<br>
>localhost:4000/api/v1/user/changepassword<br>
>localhost:4000/api/v1/user/update<br>

3. Admin specific routes
- These routes are protected by [`userRole`](https://github.com/khairnarsaurabh23/eShop/blob/main/middlewares/user.js) middleware
>localhost:4000/api/v1/admin/users<br>
>localhost:4000/api/v1/user/:id<br>
Last admin route has Get, Put, Delete Http methods associated with it. 
So depending on request it'll perform its specific action.

###  Product Routes
1. Review Routes
>localhost:4000/api/v1/review<br>
- This Route has Post(add review) and Delete(delete review) methods associated with it. 
Hence depending upon Http request it'll perform its action.

2. Admin Specific Routes
>localhost:4000/api/v1/admin/addproduct<br>
>localhost:4000/api/v1/admin/update/:id<br>
- Last admin route has Http Put and Delete methods associated with it.

### Payment routes
1. Get routes
>localhost:4000/api/v1/stripekey<br>
>localhost:4000/api/v1/razorpaykey<br>
- These routes will get the public key to proceed with payment.

2. Make payment route
>localhost:4000/api/v1/payment/stripe<br>
>localhost:4000/api/v1/payment/rezorpay<br>
- The route to make a payment using gateway 

### Order routes
>localhost:4000/api/v1/order<br>
>localhost:4000/api/v1/user/order<br>
>localhost:4000/api/v1/:id<br>
- Second route will get all orders of current user.
- Last route well get a specific order using its id.

<hr>
### Full Documentation about routes  [Here](https://github.com/khairnarsaurabh23/eShop/blob/main/swagger.yaml)
