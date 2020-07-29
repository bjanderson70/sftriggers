import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { Connection, RecordResult } from 'jsforce';

//
// Originally by Oscar Scholten
//
// Modifications:
//    + [BJA] fixed the find and use query instead,
//    + [BJA] create the apexTriggerMetadata [Metadata]
//    + [BJA] allowed variations of True and False, i.e. 'T', '1', etc.
//
// Note: TBD ... This DOES NOT retain previous state of Triggers.
//
export default class SetTriggerStatus extends SfdxCommand {

  public static description = "Set status of all triggers to Active or Inactive";

  public static examples = [
    `$ sfdx action:setTriggerStatus --targetusername myOrg@example.com -s Active`
  ];

  
  protected static flagsConfig = {
    status: flags.string({ char: 's', description: 'new status for all triggers ([Active|1|true] | [Inactive|0|false])' }),
    help: flags.help({ char: 'h' })
  };
  

  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    // just convert to uppercase
    var flag = this.flags.status.toUpperCase(),
        forSearch=flag;
    // decide what to do
    switch(flag) {
      case "1":
      case "TRUE":
      case "T":
      case "A":
      case "ACTIVE":
        flag = "Active";
        forSearch="Inactive";
        break;  
      case "0":
      case "FALSE":
      case "F":
      case "I":
      case "INACTIVE":
        flag = "Inactive";
        forSearch="Active";
        break; 
      default:
        this.error(`status parameter must be either for ACTIVE == <'Active', '1' or 'true'> or for INACTIVE ==  <'Inactive' '0' or 'false'>`);
    }
    this.flags.status=flag;


    this.ux.log(`Setting all triggers to status '${this.flags.status}'`);
    this.ux.startSpinner('Creating request');

    const connection = this.org.getConnection();

    const triggers = await this.getTriggerData(connection, forSearch);

    const container = await connection.tooling.sobject('MetadataContainer').create({ 'Name': `container-${new Date().getTime()}` });

    await this.populateRequest(connection, triggers, container['id']);

    this.ux.stopSpinner();
    this.ux.startSpinner('Awaiting response');

    const containerAsyncRequest = await connection.tooling.sobject('ContainerAsyncRequest').create({
      'MetadataContainerId': container['id'],
      'isCheckOnly': false
    });

    while (true) {
      const containerAsyncRequestStatus = await connection.tooling.sobject('ContainerAsyncRequest').retrieve(containerAsyncRequest['id']);
      if (containerAsyncRequestStatus['State'] !== 'Queued') {
        const deployDetails = containerAsyncRequestStatus['DeployDetails'] !== undefined ? containerAsyncRequestStatus['DeployDetails'] : {};
        const failureCount = Array.isArray(deployDetails['componentFailures']) ? deployDetails['componentFailures'].length : 0;
        const successCount = Array.isArray(deployDetails['componentSuccesses']) ? deployDetails['componentSuccesses'].length : 0;
        if (failureCount > 0 || successCount !== triggers.length) {
          this.ux.log(JSON.stringify(containerAsyncRequestStatus, null, 2));
          this.error(`Error updating trigger status, see log for details; failureCount=${failureCount} successCount=${successCount} triggerCount=${triggers.length}`);
        }
        break;
      };
    }

    this.ux.stopSpinner();
    const msg = `Successfully updated all ${triggers.length} triggers to status '${this.flags.status}'`;
    this.ux.log(msg);

    return { 'Result': msg };
  }

  private populateRequest(connection: Connection, triggers: any[], containerId: string): Promise<void> {
    
    return new Promise((resolve, reject) => {
      var promises: Promise<RecordResult>[] = [];
     
      for (var i = 0; i < triggers.length; i++) {
        // BJA -- metadata
        const apexTriggerMetadata ={
          'apiVersion': triggers[i]['ApiVersion'],
          'status': this.flags.status
        
        };
        const apexTriggerMember = {
          'MetadataContainerId': containerId,
          'ContentEntityId': triggers[i]['Id'],
          'Body': triggers[i]['Body'],
          'Metadata': apexTriggerMetadata
        }

        promises.push(connection.tooling.sobject('ApexTriggerMember').create(apexTriggerMember));
      }

      Promise.all(promises)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  //
  // BJA : Change the access of ApexTrigger ...
  //
  private getTriggerData(connection: Connection, forSearch: String): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      /*
      Cannot use find{} as we will get a MALFORM Query error;
      So query instead; we look only for those for 'forSearch'
      Thus, if we want to change status tpo 'Active', 'forSearch' will look for 'InActive' triggers
     */

    var records = [];
    connection.tooling.query("SELECT Id, Name,Status,Body,ApiVersion FROM ApexTrigger where status='" + forSearch + "'")
    .on("record", function(record) {
      records.push(record);
    })
    .on("end", function() {
      resolve(records);
    })
    .on("error", function(err) {
      this.error(err);
    })
    .run({ autoFetch : true, maxFetch : 5000 }); // <Max. amount fetch .. Cannot assume > 5000 triggers
    });
  }
}
