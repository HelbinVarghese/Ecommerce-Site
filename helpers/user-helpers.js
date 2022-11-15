var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectId
// const { Collection } = require('mongodb')
module.exports={
    doSignup:(userData)=>{
        // console.log(userData)
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                userData._id = data.insertedId;
                resolve(userData);
                
            })
            
        })

    },

    doLogin:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            let loginstatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log(status)
                        console.log("Logged in")
                        response.user=user;
                        response.status=true;
                        resolve(response)
                    }else{
                        console.log('err')
                        console.log("Login Failed")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("Login failed")
                resolve({status:false})
            }
        })
    },

    addtocart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1,
        }
        return new  Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart){
                
                let proExit=userCart.products.findIndex(product=> product.item==proId)
                console.log(proExit)
                if(proExit!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve();
                    })
                }else{

                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:objectId(userId)},
                {$push:{products:proObj}}
                ).then((response)=>{
                    resolve()
                })
                }


            }else{
                let cartobj={
                    user:objectId(userId),
                    products: [ proObj ]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((response)=>{
                    resolve()
                })
            }
        })
    },

    getCartProducts:(userID)=>{
        // console.log(userID)
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userID)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },

                {
                    $lookup:{
                        from:collection.Product_collection,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },

                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                
            ]).toArray()
            // console.log(cartItems)
            resolve(cartItems)
           
        })


},

getcartcount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count = 0
        let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        if(cart){
            count=cart.products.length
        }
        resolve(count)
    })
},

changeProductQuantity:(details)=>{
    count=parseInt(details.count)
    quantity=parseInt(details.quantity)


    return new Promise((resolve,reject)=>{
        if(details.count==-1 && details.quantity==1){
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
            {
                $pull:{products:{item:objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({RemoveProduct:true})
            })
        }else{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
            {
                $inc:{'products.$.quantity':count}
            }
            ).then((response)=>{ 
                resolve({status:true});
            })
        }

    })
},

RemoveProductcart:(datas)=>{
    console.log(datas)
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(datas.cartId)},
        {
            $pull:{products:{item:objectId(datas.proId)}}
        }
        ).then((response)=>{
            resolve({RemoveProduct:true})
        })
    })
},

getTotalAmount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },

            {
                $lookup:{
                    from:collection.Product_collection,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },

            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            },

            {
                $group:{
                    _id:null,
                    // total:{$sum:{$multiply:[$toInt:'$quantity','$product.Price']}}
                    total: {$sum: {$multiply: [{ $toInt: "$quantity" }, { $toInt: "$product.Price" }]}}
                }
            }
            
        ]).toArray()
        console.log(total,'this is total')
        if(total.length > 0){
            resolve(total[0].total)
        }else{
            resolve([]);
        }
        
       
    })
    
},

placeOrder:(order,products,total)=>{
    return new Promise(async(resolve,reject)=>{
        console.log(order,products,total)
    })
},

getCartProductList:(userId)=>{
    return new Promise (async(resolve,reject)=>{
        console.log("User Id: "+ userId)
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        console.log(cart)
        resolve(cart.products)
    })
}

}
