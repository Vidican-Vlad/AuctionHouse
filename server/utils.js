const db=require("./config/db").db


const findByField = async (table,collumn,value) => {
    return new Promise((resolve, reject) =>{
        db.query('SELECT * FROM ?? where ?? = ?',[table,collumn,value],(err,result)=>{
            if(err)
                reject(err);
            resolve(result);
        })
    })
}
const insert = async (table,fields,values) =>{
    return new Promise((resolve, reject) =>{
         db.query('INSERT INTO ?? (??) values (?)',[table,fields,values],(err,result) =>{
            if(err)
                {
                    console.log(err)
                    reject(false);
                }
            resolve(result);
        })
    })
}

const getAllRows = async (table,fields) => {

    return new Promise((resolve, reject) =>{
       
        var query = db.query("SELECT ?? from ??",[fields,table],(err,result) => {
            // console.log(query);
            if(err)
                reject(err);
            resolve(result);
        })
        
    })
}
const getAllRowsWhere = async (table,fields,conditionField,value) =>{
    return new Promise ((resolve,reject) => {
        var query = db.query("SELECT ?? FROM ?? WHERE ?? = ?",[fields,table,conditionField,value],(err,result) => {
            if(err)
            {   
                console.log(err);
                reject(err);
            }
            resolve(result);
        })

    })
}

const promiseFromQuery = async(sql)=>{
    return new Promise((resolve,reject)=>{
        db.query(sql,(err,result) =>{
            if(err)
            {
                console.log(err);
                reject(err);
            }
            resolve(result);
        })
    })
}

const chainedConditionsHelper = (condition) =>{   

    //returns a pre-formated sql condition 
    if(condition.operator == "BETWEEN")
    {
        return`${condition.field} BETWEEN `+db.escape(condition.value[0]) +" AND "+db.escape(condition.value[1]);
    }
    if(condition.operator == "IN")
    {
        return `${condition.field} in (` +db.escape(condition.value)+")"
    }
    return `${condition.field} ${condition.operator} `+db.escape(condition.value);
    
}
const queryBuilderHelper = (conditions,chainOperator="AND") =>{
    var sql ="";
    if(conditions.length > 0)
    {
        // console.log("intra in if");
        sql+=" WHERE "+chainedConditionsHelper(conditions[0])
        if(conditions.length > 1)
        {
            conditions.shift();
            conditions.forEach(condition => {
                sql+=` ${chainOperator} `+chainedConditionsHelper(condition);
            })
        }
    }
    return sql;
}


const selectQueryBuilder = async (table,fields,conditions=[],chainOperator="AND") =>{
    var sql = "SELECT ?? FROM ??";
    // if(conditions.length > 0)
    // {
    //     sql+=" WHERE "+chainedConditionsHelper(conditions[0])
    //     if(conditions.length > 1)
    //     {
    //         conditions.shift();
    //         conditions.forEach(condition => {
    //            sql+=` ${chainOperator} `+chainedConditionsHelper(condition)
    //           })
    //     }
    // }
    sql+=queryBuilderHelper(conditions,chainOperator);
    sql =db.format(sql,[fields,table]);
    // console.log(sql);

//    return new Promise ((resolve,reject) => {
//        db.query(sql,(err,result)=> {
//            if(err)
//            {
//                console.log(err)
//                reject(err);
//            }
//            resolve(result);
//        })
//    })
    return promiseFromQuery(sql);
}
const deleteQueryBuilder = async (table,conditions=[], chainOperator="AND") =>{
    var sql = `DELETE FROM ${db.escapeId(table)}`;
    // if(conditions.length > 0)
    // {
    //     sql+=" WHERE "+chainedConditionsHelper(conditions[0])
    //     if(conditions.length > 1)
    //     {
    //         conditions.shift();
    //         conditions.forEach(condition =>{
    //             sql+=` ${chainOperator} `+chainedConditionsHelper(condition)
    //         })
    //     }
    // }
    sql+=queryBuilderHelper(conditions,chainOperator);

    // return new Promise ((resolve,reject) => {
    //     db.query(sql,(err,result)=> {
    //         if(err)
    //         {
    //             console.log(err);
    //             reject(err);
    //         }
    //         resolve(result);
    //     })
    // })
    return promiseFromQuery(sql)
}
const updateQueryBuilder = async (table,valuePairs,conditions, chainOperator="AND") =>{
    var sql = `UPDATE ${db.escapeId(table)} SET`
    sql+= " "+db.escapeId(valuePairs[0].col)+" = "+db.escape(valuePairs[0].val)
    if(valuePairs.length > 1)
    {
        valuePairs.shift();
        valuePairs.forEach((pair) => {
            sql+= ", "+db.escapeId(pair.col)+" = "+db.escape(pair.val)
        })
    }

    sql+=queryBuilderHelper(conditions,chainOperator);
    return promiseFromQuery(sql);
}

module.exports={findByField,insert,getAllRows,getAllRowsWhere,deleteQueryBuilder,selectQueryBuilder,updateQueryBuilder}