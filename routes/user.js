// const { response } = require('express');
const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

//Middile ware//

function verfylogin(req,res,next){
if(req.session.loggedIn){
  next()
}else{
  res.redirect('/login')
}
}


/* GET home page. */
router.get ('/', async function(req, res, next) {
  let user=req.session.user
  let cartcount=null;
  if(req.session.user){
    cartcount=await userHelpers.getcartcount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('users/view-products', {products,user,cartcount});
  })
 
  
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('users/login',{"loginerr":req.session.loginerr})
    req.session.loginerr=false
  }
  
})
router.get('/signup',(req,res)=>{
  res.render('users/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.loggedIn=true,
    req.session.user=response
    res.redirect('/')
    
  })

})
  router.post('/login',(req,res)=>{
     userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        res.redirect('/')
      }else{
        req.session.loginerr="Invalid Password or Email"
        res.redirect('/login')
      }
     })

  })

router.get('/logout',((req,res)=>{
  req.session.destroy()
  res.redirect('/')
}))

router.get('/cart',verfylogin,(async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products)
  res.render('users/cart',{products,user:req.session.user,totalValue})
}))
router.get('/add-to-cart/:id',async(req,res)=>{
  console.log("api calling")
  userHelpers.addtocart(req.params.id,req.session.user._id).then(()=>{
   res.json({status:true})
  })
}),

router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
   response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
}),

router.post('/remove-product-cart',(req,res)=>{
  userHelpers.RemoveProductcart(req.body).then((response)=>{
    res.json(response)
  })
}),

router.get('/place-order',verfylogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/place-order',{user:req.session.user,total})
})

router.post('/place-order',async(req,res)=>{
  console.log(req.body)
  let products=await userHelpers.getCartProductList(req.body.UserId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.UserId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json({status:true})
  })
    console.log(req.body)
  
})

router.get('/order-success',verfylogin,(req,res)=>{
  res.render('users/order-success',{user:req.session.user})
})

router.get('/view-orders',verfylogin,async(req,res)=>{
  console.log("userid router",req.session.user._id)
  let orders = await userHelpers.getuserorders(req.session.user._id)
  console.log(orders)
  res.render('users/view-orders',{user:req.session.user,orders})
})

module.exports = router;
