const utils = require("../utils");
const db = require("../config/db").db
const mailer = require("../config/nodemailer");

const createBid = async(req,res)=>{    
    try {
        const price=Math.floor(parseInt(req.body.price))
        //update post currentPrice and highestBidder
        await utils.updateQueryBuilder("post",
            [{
                col:"currentPrice",
                val:price
            },
            {
                col:"highestBidder",
                val:req.userID
            }],
            [{operator:"=",field:"postID",value:req.post.postID}])
        //update user balance
        await utils.updateQueryBuilder("user",[{col:"balance",val:req.user.balance-price}],[{operator:"=",field:"UserID",value:req.userID}])

        //check if bid already exists in db, if so just update the price, else create it
        let oldBid = await utils.selectQueryBuilder("bid",["bidID","postID","userID","price"],
            [{
                operator:"=",
                field:"postID",
                value:req.post.postID
            },
            {
                operator:"=",
                field:"userID",
                value:req.userID
            }])
        if(oldBid && oldBid.length > 0)
        {
            oldBid = oldBid[0];
            await utils.updateQueryBuilder("bid",[{col:"price",val:price}],
                [{
                    operator:"=",
                    field:"postID",
                    value:req.post.postID
                },
                {
                    operator:"=",
                    field:"userID",
                    value:req.userID
                }])
        }
        else
        {
           await utils.insert("bid",["postID","userID","price"],[req.post.postID,req.userID,price]);
        }
        //if there was a previous highestBidder send them an outBid mail and refund their bid
        if(req.post.highestBidder!==null)
        {  
            const exHighestBidder = await utils.findOneOrFail("user","UserID",req.post.highestBidder)
            await mailer.outBidMail(exHighestBidder.email,req.user.username,price,req.post.currentPrice);
            await utils.updateQueryBuilder("user",[{col:"balance",val:exHighestBidder.balance+req.post.currentPrice}],[{operator:"=",field:"UserID",value:exHighestBidder.UserID}])
        }    
        res.status(200).json({message:"bidding succesfull, you are currently the highest bidder"});
    } catch (err) {
        console.log(err);
        res.status(400).json({message:"there was an error in creating your bid"})
    }
}

const getAllBids= (userID) =>{
    var sql = `select post.postID,ownerID,highestBidder,currentPrice,endTime,description,price from post inner join bid on post.postID = bid.postID where userID = ${userID}`
    return new Promise((resolve,reject)=>{
        db.query(sql,(err,result)=>{
            if(err)
            {
                console.log(err);
                reject(err);
            }
            resolve(result);
        })
    })
}

const myHistory = async (req,res) =>{
   try{
    const myPosts =  await utils.selectQueryBuilder("post",["postID","ownerID","highestBidder","currentPrice","endTime","description"],[{operator:"=",field:"ownerID",value:req.userID}]);
    const myBids =  await getAllBids(req.userID);
    const result ={
        myPosts,
        myBids
    }
    res.status(200).json(result);
   }catch(err){
   res.status(500).json(err);
   }
}



module.exports = {createBid,myHistory}
