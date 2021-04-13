import * as mysql from "mysql";
import { MySqlQueryResponse, MySqlUtils } from "../../../epl-mysql/MySqlUtils";
import { CommandResult } from "../../types/Command";

export class TestDbCmd{



    public async run():Promise<any> {

        let sqlRes:MySqlQueryResponse = await MySqlUtils.query('SHOW VARIABLES LIKE "%version%";')

        if(sqlRes.error) {
            return new CommandResult(sqlRes.error);
        }
        else 
            return new CommandResult('done!', sqlRes);

    }



}