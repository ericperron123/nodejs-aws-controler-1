import * as mysql from "mysql";

export class MySqlUtils {


    public static async query(query:string):Promise<MySqlQueryResponse> {
        
        let endPoint:string = "sys1-database2.crorjygqwkjw.us-east-2.rds.amazonaws.com";
        let userName:string = "admin";
        let port:number = 3306;

        let connection:mysql.Connection = mysql.createConnection({
            host: 'sys1-database2.crorjygqwkjw.us-east-2.rds.amazonaws.com',
            user: 'admin',
            password: 'QMVLWLqv',
            database: null
        });   
        
        return new Promise((resolve, reject) => {

            connection.connect((err) => {
                if(err)
                {
                    console.log(err.message)
                    reject(err);
                }
                
                
                connection.query(query, (error: mysql.MysqlError, results: any, fields: any) => {

                    let r: MySqlQueryResponse = new MySqlQueryResponse(error, results, fields);
                    resolve(r);
                });

                connection.end();
            });
        });
    }

}

export class MySqlQueryResponse {
    
    public error:mysql.MysqlError;
    public results:any;
    public fields:any;
    
    public constructor(error:mysql.MysqlError, results:any, fields:any){
        this.error = error;
        this.results = results;
        this.fields = fields;
    }

}