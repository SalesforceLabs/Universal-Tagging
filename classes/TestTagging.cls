@isTest(SeeAllData=true)
public with sharing class TestTagging {
  static testMethod void taggingTests() {
    Contact c = new Contact(LastName = 'Test');
    insert c;
    Tagging.insertTagAndTagging('Test Tag', c.Id, 'Contact');

    Tagging.getRecordTags(c.Id);
    Tag__c tag = [SELECT id FROM Tag__c WHERE Name = 'Test Tag' LIMIT 1];

    Tagging.queryTags('Test');
    Tagging.getRelatedTaggedRecords(tag.Id);
    Tagging.deleteTagging(c.Id, tag.Id);

    try {
      Tagging.insertTagAndTagging(null, null, null);
    } catch (exception e) {
      system.debug(e.getMessage());
    }

    try {
      Tagging.getRecordTags(null);
    } catch (exception e) {
      system.debug(e.getMessage());
    }
    try {
      Tagging.queryTags(null);
    } catch (exception e) {
      system.debug(e.getMessage());
    }
    try {
      Tagging.getRelatedTaggedRecords(null);
    } catch (exception e) {
      system.debug(e.getMessage());
    }
    try {
      Tagging.deleteTagging(null, null);
    } catch (exception e) {
      system.debug(e.getMessage());
    }
  }

  static testMethod void checkAccessTest() {
    try {
      Tagging.checkAccess('UniTag__Tag__c', 'id', 'read');
    } catch (Exception e) {
      System.debug(e.getMessage());
    }
    try {
      Tagging.checkAccess('UniTag__Tag__c', 'id', 'create');
    } catch (Exception e) {
      System.debug(e.getMessage());
    }
    try {
      Tagging.checkAccess('UniTag__Tag__c', 'id', 'update');
    } catch (Exception e) {
      System.debug(e.getMessage());
    }
    try {
      Tagging.checkAccess('UniTag__Tag__c', '', 'delete');
    } catch (Exception e) {
      System.debug(e.getMessage());
    }
    try {
      Tagging.checkAccess('foo', 'id', 'read');
    } catch (Exception e) {
      System.debug(e.getMessage());
    }
    try {
      Tagging.checkAccess('UniTag__Tag__c', 'bar', 'read');
    } catch (Exception e) {
      System.debug(e.getMessage());
    }
  }

  static testMethod void postInstallScriptTest() {
    TaggingPostInstallScript postinstall = new TaggingPostInstallScript();
    Test.testInstall(postinstall, null);
    Test.testInstall(postinstall, new Version(1, 0));
  }
}