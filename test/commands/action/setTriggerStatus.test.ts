import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';

describe('action:setTriggerStatus', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      const requestMap = ensureJsonMap(request);
      if (ensureString(requestMap.url).match(/Organization/)) {
        return Promise.resolve({ records: [ { Name: 'Super Awesome Org', TrialExpirationDate: '2018-03-20T23:24:11.000+0000'}] });
      }
      return Promise.resolve({ records: [] });
    })
    .stdout()
    .command(['action:setTriggerStatus', '--targetusername', 'test@org.com', '-s', 'Active'])
    .it('runs action:setTriggerStatus --targetusername test@org.com -s Active', ctx => {
      expect(ctx.stdout).to.contain('Setting all triggers to status Active');
    });
});
