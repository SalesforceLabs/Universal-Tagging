global class TaggingPostInstallScript implements InstallHandler {
  global void onInstall(InstallContext context) {
    try {
      User u = [
        SELECT Id, Email, Name
        FROM User
        WHERE Id = :context.installerID()
      ];
      Organization o = [
        SELECT Id, Name, organizationtype, issandbox
        FROM Organization
        WHERE Id = :context.organizationId()
      ];
      String toAddress = 'ryan.mcconnell@salesforce.com';
      String[] toAddresses = new List<String>{toAddress};
      Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
      mail.setToAddresses(toAddresses);
      mail.setSubject('Universal Tagging Installation');
      mail.setPlainTextBody(
        'User Name: ' + u.Name + '\n' + 'User Email: ' + u.Email + '\n' +
        'User Id: ' +
        u.Id +
        '\n\n' +
        'Org Name: ' +
        o.Name +
        '\n' +
        'Org Type: ' +
        o.organizationtype +
        '\n' +
        'Org Id: ' +
        o.Id +
        '\n' +
        'Org Is Sandbox: ' +
        o.issandbox +
        '\n' +
        'Is upgrade: ' +
        context.isUpgrade()
      );
      Messaging.sendEmail(new List<Messaging.Email>{mail});
    } catch (Exception e) {
      System.debug(e.getMessage());
    }
  }
}