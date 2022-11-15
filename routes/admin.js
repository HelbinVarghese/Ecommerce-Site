const { response } = require('express');
var express = require('express');
const { deleteProduct } = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
// var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
productHelpers.getAllProducts().then((products)=>{
  console.log(products)
  res.render('admin/view-products',{products,admin:true});
})
 
});

router.get('/add-products',function(req,res){
  res.render('admin/add-products')
  
})

router.post('/add-products',(req,res)=>{
  productHelpers.addProduct(req.body,(id)=>{
    console.log(id)
    let image=req.files.image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-products")
      }else{
        console.log(err)
      }
    })
    
  })
})

router.get('/delete-product/:id',((req,res)=>{
  let proid=req.params.id
  console.log(proid)
  productHelpers.deleteProduct(proid).then((response)=>{
    res.redirect('/admin/')
  })
}))

router.get('/edit-product/:id',async(req,res)=>{
  let products= await productHelpers.getproductDetails(req.params.id)
  console.log(products)
  res.render('admin/edit-products',{products})
})

router.post('/edit-products/:id',(req,res)=>{
  let id=req.params.id
  productHelpers.updateProducts(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image=req.files.image
      console.log(req.files.image,"hey")
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
  
})

module.exports = router;