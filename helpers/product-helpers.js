var db=require('../config/connection')
var collection=require('../config/collections');
const { response } = require('express');
const collections = require('../config/collections');
var objectId=require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{
        console.log(product);
        
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.Product_collection).find().toArray()
            resolve(products)
        })
    },

    deleteProduct:(proid)=>{
        return new Promise (async(resolve,reject)=>{
            db.get().collection(collection.Product_collection).deleteOne({_id:objectId(proid)}).then((response)=>{
                resolve(response)
            })
        })
    },
    
    getproductDetails:(proid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.Product_collection).findOne({_id:objectId(proid)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProducts:(proid,ProductDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.Product_collection).updateOne({_id:objectId(proid)},{
                $set:{
                    Name:ProductDetails.Name,
                    Category:ProductDetails.Category,
                    Description:ProductDetails.Description,
                    Price:ProductDetails.Price,
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

}