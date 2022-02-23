public with sharing class Tagging {
  @AuraEnabled
  public static List<Tag__c> queryTags(String query) {
    try {
      query = String.escapeSingleQuotes(query);
      checkAccess('UniTag__Tag__c', 'Id,Name', 'read');
      return [
          FIND :query + '*'
          IN NAME FIELDS
          RETURNING UniTag__Tag__c(Id, Name)
        ][
        0
      ];
    } catch (exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static List<Tagging__c> getRecordTags(String recordId) {
    try {
      recordId = String.escapeSingleQuotes(recordId);
      checkAccess('UniTag__Tagging__c', 'UniTag__Tag__c', 'read');
      checkAccess('UniTag__Tag__c', 'Name', 'read');
      return [
        SELECT Tag__r.Name
        FROM UniTag__Tagging__c
        WHERE UniTag__Record_Id__c = :recordId
        ORDER BY createddate
      ];
    } catch (exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static Void insertTagAndTagging(string tagName, string recordId, string objectApiName) {
    try {
      string tagId = insertTag(tagName);
      insertTagging(tagId, recordId, objectApiName);
    } catch (exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  public static string insertTag(string tagName) {
    try {
      UniTag__Tag__c tag = new UniTag__Tag__c(Name = tagName);
      checkAccess('UniTag__Tag__c', tag, 'create');
      insert tag;
      return tag.Id;
    } catch (exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  private static String getRecordName(Id recordId, string objectApiName) {
    objectApiName = String.escapeSingleQuotes(objectApiName);
    String nameField = getNameField(recordId);
    String queryString = 'select ' + nameField + ' from ' + objectApiName +
    ' where Id = \'' +
    recordId +
    '\'';
    sobject[] records = Database.query(queryString);
    String result = '';
    if (records.size() > 0)
      result = (String) records[0].get(nameField);
    return result;
  }
  
  private static String getNameField(Id recordId) {
    String result = '';
    Schema.SObjectType token = recordId.getSObjectType();
    for (Schema.SObjectField f: token.getDescribe().fields.getMap().values()) {
      Schema.DescribeFieldResult dfr = f.getDescribe();
      if (dfr.isNameField() == true) {
        result = dfr.getName();
        break;
      }
    }
    return result;
  }

  @AuraEnabled
  public static String insertTagging(string tagId, string recordId, string objectApiName) {
    try {
      String recordName = getRecordName(recordId, objectApiName);
      UniTag__Tagging__c tagging = new UniTag__Tagging__c(
        UniTag__Tag__c = tagId,
        UniTag__Record_Id__c = recordId,
        UniTag__sObject_Type__c = objectApiName,
        UniTag__Record_Name__c = recordName
      );
      checkAccess('UniTag__Tagging__c', tagging, 'create');
      insert tagging;
      return tagging.Id;
    } catch (exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static Void deleteTagging(String recordId, String tagId) {
    try {
      checkAccess('UniTag__Tagging__c', '', 'delete');
      delete [
        SELECT Id
        FROM UniTag__Tagging__c
        WHERE (UniTag__Tag__c = :tagId AND UniTag__Record_Id__c = :recordId)
      ];
    } catch (exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static Map<string, List<sobject>> getRelatedTaggedRecords(String tagId) {
    try {
      checkAccess(
        'UniTag__Tagging__c',
        'UniTag__sObject_Type__c,UniTag__Record_Id__c',
        'read'
      );
      tagId = String.escapeSingleQuotes(tagId);
      UniTag__Tagging__c[] taggings = [
        SELECT UniTag__sObject_Type__c, UniTag__Record_Id__c
        FROM UniTag__Tagging__c
        WHERE UniTag__Tag__c = :tagId
      ];
      Map<string, string[]> taggedRecordMap = buildMapOfTaggedRecords(taggings);
      return executeQueries(taggedRecordMap);
    } catch (exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  // build map of types : ids[]
  public static Map<string, string[]> buildMapOfTaggedRecords(UniTag__Tagging__c[] taggings) {
    Map<string, string[]> taggedRecordMap = new Map<string, string[]>{};

    for (UniTag__Tagging__c tag: taggings) {
      if (taggedRecordMap.containsKey(tag.UniTag__sObject_Type__c)) {
        taggedRecordMap.get(tag.UniTag__sObject_Type__c).add(
          tag.UniTag__Record_Id__c
        );
      } else {
        taggedRecordMap.put(
          tag.UniTag__sObject_Type__c,
          new List<string>{tag.UniTag__Record_Id__c}
        );
      }
    }
    return taggedRecordMap;
  }

  // build and perform queries from map
  public static Map<string, List<sobject>> executeQueries(Map<string, string[]> taggedRecordMap) {
    Map<string, List<sobject>> result = new Map<string, List<sobject>>{};

    Map<String, String> nameFieldToSobjectMap = getNameFieldtoSobjectMap(
      taggedRecordMap
    );

    for (string type: taggedRecordMap.keySet()) {
      string[] recordIds = taggedRecordMap.get(type);
      try {
        string nameField = nameFieldToSobjectMap.get(type);
        checkAccess((String) type, 'Id,' + nameField, 'read');
        result.put(
          type,
          Database.query(
            'SELECT id, ' + nameField + ' FROM ' + type + ' WHERE id in (\'' +
            String.join(recordIds, '\',\'') +
            '\')'
          )
        );
      } catch (exception e) {
        continue;
      }
    }
    return result;
  }

  public static Map<String, String> getNameFieldtoSobjectMap(Map<string, string[]> taggedRecordMap) {
    FieldDefinition[] nameFields = [
      SELECT QualifiedApiName, EntityDefinition.QualifiedApiName
      FROM FieldDefinition
      WHERE
        (EntityDefinition.QualifiedApiName IN :taggedRecordMap.keySet()
        AND IsNameField = true)
    ];

    Map<String, String> nameFieldToSobjectMap = new Map<String, String>{};

    for (FieldDefinition fd: nameFields) {
      nameFieldToSobjectMap.put(
        (String) fd.EntityDefinition.QualifiedApiName,
        (String) fd.QualifiedApiName
      );
    }

    return nameFieldToSobjectMap;
  }

  @TestVisible
  private static void checkAccess(string sobjectName, String fieldsString, string accessType) {
    string[] fields = fieldsString.split(',');
    checkAccess(sobjectName, fields, accessType);
  }
  @TestVisible
  private static void checkAccess(string sobjectName, String[] fields, string accessType) {
    SObjectType sobj = Schema.getGlobalDescribe().get(sobjectName);
    if (sobj == null) {
      AuraHandledException e = new AuraHandledException(
        'Access to one or more necessary objects is restricted for the current user: ' +
        sobjectName
      );
      e.setMessage(
        'Access to one or more necessary objects is restricted for the current user: ' +
        sobjectName
      );
      throw e;
    }

    Map<String, Schema.SObjectField> sobjectfields = sobj.getDescribe().fields.getMap();
    String[] systemFields = new List<String>{
      'Id',
      'IsDeleted',
      'CreatedBy',
      'CreatedById',
      'CreatedDate',
      'LastModifiedBy',
      'LastModifiedById',
      'LastModifiedDate',
      'SystemModstamp'
    };

    // Check if the user has access to field
    // Pass error to client
    // Due to a quirk with AuraHandledException, the message is only passed to the client when the message is set in both ways
    // as it is below.
    if (accessType == 'create') {
      for (String field: fields) {
        if (
          systemFields.indexOf(field) > -1 ||
          sobjectfields.get(field).getDescribe().isCalculated() ||
          sobjectfields.get(field).getDescribe().isAutoNumber()
        )
          continue;
        if (!sobjectfields.get(field).getDescribe().isCreateable()) {
          AuraHandledException e = new AuraHandledException(
            'Access to one or more necessary fields is restricted for the current user: ' +
            field
          );
          e.setMessage(
            'Access to one or more necessary fields is restricted for the current user: ' +
            field
          );
          throw e;
        }
      }
    } else if (accessType == 'read') {
      for (String field: fields) {
        if (!sobjectfields.get(field).getDescribe().isAccessible()) {
          AuraHandledException e = new AuraHandledException(
            'Access to one or more necessary fields is restricted for the current user: ' +
            field
          );
          e.setMessage(
            'Access to one or more necessary fields is restricted for the current user: ' +
            field
          );
          throw e;
        }
      }
    } else if (accessType == 'update') {
      for (String field: fields) {
        if (
          systemFields.indexOf(field) > -1 ||
          sobjectfields.get(field).getDescribe().isCalculated() ||
          sobjectfields.get(field).getDescribe().isAutoNumber()
        )
          continue;
        if (!sobjectfields.get(field).getDescribe().isUpdateable()) {
          AuraHandledException e = new AuraHandledException(
            'Access to one or more necessary fields is restricted for the current user: ' +
            field
          );
          e.setMessage(
            'Access to one or more necessary fields is restricted for the current user: ' +
            field
          );
          throw e;
        }
      }
    } else if (accessType == 'delete') {
      if (!sobj.getDescribe().isDeletable()) {
        AuraHandledException e = new AuraHandledException(
          'Access to one or more necessary objects is restricted for the current user.'
        );
        e.setMessage(
          'Access to one or more necessary objects is restricted for the current user.'
        );
        throw e;
      }
    }
  }

  //for updates of sObjects passed from client
  @TestVisible
  private static void checkAccess(string sobjectName, sObject objectToCheck, string accessType) {
    SObjectType sobj = Schema.getGlobalDescribe().get(sobjectName);
    if (sobj == null) {
      AuraHandledException e = new AuraHandledException(
        'Access to one or more necessary objects is restricted for the current user: ' +
        sobjectName
      );
      e.setMessage(
        'Access to one or more necessary objects is restricted for the current user: ' +
        sobjectName
      );
      throw e;
    }
    Map<String, Schema.SObjectField> sobjectfields = sobj.getDescribe().fields.getMap();

    Map<String, Object> fieldMap = objectToCheck.getPopulatedFieldsAsMap();
    Set<string> fields = fieldMap.keySet();
    string[] fieldList = new List<string>{};
    for (string field: fields) {
      if (field.indexOf('__r') > -1)
        field = field.replace('__r', '__c');
      fieldList.add(field);
    }
    checkAccess(sobjectName, fieldList, accessType);
  }
}