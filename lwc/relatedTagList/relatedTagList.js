/* eslint-disable no-console */
import { LightningElement, api, wire, track } from 'lwc'
import { registerListener, unregisterAllListeners } from 'c/pubsub'
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation'
import getRelatedTaggedRecords from '@salesforce/apex/Tagging.getRelatedTaggedRecords'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class RelatedTagList extends NavigationMixin(LightningElement) {
  @wire(CurrentPageReference) pageRef

  @track
  related = []

  @api
  recordId
  @api
  tagLabel

  connectedCallback() {
    registerListener('listRelatedTagged', this.handleRelatedItems, this)
  }

  async handleRelatedItems({ tagId, tagLabel }) {
    try {
      const related = await getRelatedTaggedRecords({ tagId })
      this.tagLabel = tagLabel
      Object.keys(related).forEach(k => {
        const items = related[k]
        const nameField = Object.keys(items[0]).find(f => f !== 'Id')
        items.forEach(item => {
          item.type = k
          item.icon = this.getIcon(k)
          item.Name = item[nameField]
        })
      })

      this.related = Object.values(related)
        .reduce((a, r) => {
          return [...a, ...r]
        }, [])
        .filter(r => r.Id !== this.recordId)
    } catch (error) {
      this.showErrorToast(error.body.message)
    }
  }

  showErrorToast(message) {
    const evt = new ShowToastEvent({
      title: 'There was an error.',
      message: message,
      variant: 'error'
    })
    this.dispatchEvent(evt)
  }

  handleCardClick(e) {
    const recordId = e.currentTarget.dataset.recordId
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: recordId,
        actionName: 'view'
      }
    })
  }

  handleClear(e) {
    e.preventDefault()
    this.related = []
    this.tagLabel = null
  }

  disconnectedCallback() {
    unregisterAllListeners(this)
  }

  getIcon(sObjectType) {
    sObjectType = sObjectType.toLowerCase()
    const icons = {
      account: 'standard:account',
      action_list_component: 'standard:action_list_component',
      address: 'standard:address',
      agent_session: 'standard:agent_session',
      all: 'standard:all',
      announcement: 'standard:announcement',
      answer_best: 'standard:answer_best',
      answer_private: 'standard:answer_private',
      answer_public: 'standard:answer_public',
      apex_plugin: 'standard:apex_plugin',
      apex: 'standard:apex',
      approval: 'standard:approval',
      apps_admin: 'standard:apps_admin',
      apps: 'standard:apps',
      article: 'standard:article',
      asset_relationship: 'standard:asset_relationship',
      assigned_resource: 'standard:assigned_resource',
      assignment: 'standard:assignment',
      avatar_loading: 'standard:avatar_loading',
      avatar: 'standard:avatar',
      bot_training: 'standard:bot_training',
      bot: 'standard:bot',
      branch_merge: 'standard:branch_merge',
      brand: 'standard:brand',
      business_hours: 'standard:business_hours',
      calibration: 'standard:calibration',
      call_history: 'standard:call_history',
      call: 'standard:call',
      campaign_members: 'standard:campaign_members',
      campaign: 'standard:campaign',
      canvas: 'standard:canvas',
      carousel: 'standard:carousel',
      case_change_status: 'standard:case_change_status',
      case_comment: 'standard:case_comment',
      case_email: 'standard:case_email',
      case_log_a_call: 'standard:case_log_a_call',
      case_milestone: 'standard:case_milestone',
      case_transcript: 'standard:case_transcript',
      case: 'standard:case',
      channel_program_history: 'standard:channel_program_history',
      channel_program_levels: 'standard:channel_program_levels',
      channel_program_members: 'standard:channel_program_members',
      channel_programs: 'standard:channel_programs',
      choice: 'standard:choice',
      client: 'standard:client',
      cms: 'standard:cms',
      coaching: 'standard:coaching',
      code_playground: 'standard:code_playground',
      collection_variable: 'standard:collection_variable',
      connected_apps: 'standard:connected_apps',
      constant: 'standard:constant',
      contact_list: 'standard:contact_list',
      contact_request: 'standard:contact_request',
      contact: 'standard:contact',
      contract_line_item: 'standard:contract_line_item',
      contract: 'standard:contract',
      currency_input: 'standard:currency_input',
      currency: 'standard:currency',
      custom_notification: 'standard:custom_notification',
      custom: 'standard:custom',
      customer_portal_users: 'standard:customer_portal_users',
      customers: 'standard:customers',
      dashboard: 'standard:dashboard',
      data_integration_hub: 'standard:data_integration_hub',
      datadotcom: 'standard:datadotcom',
      date_input: 'standard:date_input',
      date_time: 'standard:date_time',
      decision: 'standard:decision',
      default: 'standard:default',
      display_rich_text: 'standard:display_rich_text',
      display_text: 'standard:display_text',
      document: 'standard:document',
      drafts: 'standard:drafts',
      dynamic_record_choice: 'standard:dynamic_record_choice',
      email_chatter: 'standard:email_chatter',
      email: 'standard:email',
      empty: 'standard:empty',
      endorsement: 'standard:endorsement',
      entitlement_process: 'standard:entitlement_process',
      entitlement_template: 'standard:entitlement_template',
      entitlement: 'standard:entitlement',
      entity_milestone: 'standard:entity_milestone',
      entity: 'standard:entity',
      environment_hub: 'standard:environment_hub',
      event: 'standard:event',
      feed: 'standard:feed',
      feedback: 'standard:feedback',
      file: 'standard:file',
      filter: 'standard:filter',
      first_non_empty: 'standard:first_non_empty',
      flow: 'standard:flow',
      folder: 'standard:folder',
      forecasts: 'standard:forecasts',
      formula: 'standard:formula',
      generic_loading: 'standard:generic_loading',
      global_constant: 'standard:global_constant',
      goals: 'standard:goals',
      group_loading: 'standard:group_loading',
      groups: 'standard:groups',
      hierarchy: 'standard:hierarchy',
      home: 'standard:home',
      household: 'standard:household',
      individual: 'standard:individual',
      insights: 'standard:insights',
      investment_account: 'standard:investment_account',
      iot_context: 'standard:iot_context',
      iot_orchestrations: 'standard:iot_orchestrations',
      kanban: 'standard:kanban',
      knowledge: 'standard:knowledge',
      lead_insights: 'standard:lead_insights',
      lead_list: 'standard:lead_list',
      lead: 'standard:lead',
      lightning_component: 'standard:lightning_component',
      lightning_usage: 'standard:lightning_usage',
      link: 'standard:link',
      list_email: 'standard:list_email',
      live_chat_visitor: 'standard:live_chat_visitor',
      live_chat: 'standard:live_chat',
      location: 'standard:location',
      log_a_call: 'standard:log_a_call',
      logging: 'standard:logging',
      loop: 'standard:loop',
      macros: 'standard:macros',
      maintenance_asset: 'standard:maintenance_asset',
      maintenance_plan: 'standard:maintenance_plan',
      marketing_actions: 'standard:marketing_actions',
      merge: 'standard:merge',
      messaging_conversation: 'standard:messaging_conversation',
      messaging_session: 'standard:messaging_session',
      messaging_user: 'standard:messaging_user',
      metrics: 'standard:metrics',
      multi_picklist: 'standard:multi_picklist',
      multi_select_checkbox: 'standard:multi_select_checkbox',
      news: 'standard:news',
      note: 'standard:note',
      number_input: 'standard:number_input',
      omni_supervisor: 'standard:omni_supervisor',
      operating_hours: 'standard:operating_hours',
      opportunity_splits: 'standard:opportunity_splits',
      opportunity: 'standard:opportunity',
      orders: 'standard:orders',
      outcome: 'standard:outcome',
      output: 'standard:output',
      partner_fund_allocation: 'standard:partner_fund_allocation',
      partner_fund_claim: 'standard:partner_fund_claim',
      partner_fund_request: 'standard:partner_fund_request',
      partner_marketing_budget: 'standard:partner_marketing_budget',
      partners: 'standard:partners',
      password: 'standard:password',
      past_chat: 'standard:past_chat',
      people: 'standard:people',
      performance: 'standard:performance',
      person_account: 'standard:person_account',
      photo: 'standard:photo',
      picklist_choice: 'standard:picklist_choice',
      picklist_type: 'standard:picklist_type',
      planogram: 'standard:planogram',
      poll: 'standard:poll',
      portal_roles_and_subordinates: 'standard:portal_roles_and_subordinates',
      portal_roles: 'standard:portal_roles',
      portal: 'standard:portal',
      post: 'standard:post',
      pricebook: 'standard:pricebook',
      process: 'standard:process',
      product_consumed: 'standard:product_consumed',
      product_item_transaction: 'standard:product_item_transaction',
      product_item: 'standard:product_item',
      product_request_line_item: 'standard:product_request_line_item',
      product_request: 'standard:product_request',
      product_required: 'standard:product_required',
      product_transfer: 'standard:product_transfer',
      product: 'standard:product',
      proposition: 'standard:proposition',
      question_best: 'standard:question_best',
      question_feed: 'standard:question_feed',
      queue: 'standard:queue',
      quick_text: 'standard:quick_text',
      quip_sheet: 'standard:quip_sheet',
      quip: 'standard:quip',
      quotes: 'standard:quotes',
      radio_button: 'standard:radio_button',
      read_receipts: 'standard:read_receipts',
      recent: 'standard:recent',
      record_create: 'standard:record_create',
      record_delete: 'standard:record_delete',
      record_lookup: 'standard:record_lookup',
      record_update: 'standard:record_update',
      record: 'standard:record',
      related_list: 'standard:related_list',
      relationship: 'standard:relationship',
      report: 'standard:report',
      resource_absence: 'standard:resource_absence',
      resource_capacity: 'standard:resource_capacity',
      resource_preference: 'standard:resource_preference',
      resource_skill: 'standard:resource_skill',
      return_order_line_item: 'standard:return_order_line_item',
      return_order: 'standard:return_order',
      reward: 'standard:reward',
      rtc_presence: 'standard:rtc_presence',
      sales_cadence: 'standard:sales_cadence',
      sales_path: 'standard:sales_path',
      scan_card: 'standard:scan_card',
      screen: 'standard:screen',
      search: 'standard:search',
      service_appointment_capacity_usage:
        'standard:service_appointment_capacity_usage',
      service_appointment: 'standard:service_appointment',
      service_contract: 'standard:service_contract',
      service_crew_member: 'standard:service_crew_member',
      service_crew: 'standard:service_crew',
      service_report: 'standard:service_report',
      service_resource: 'standard:service_resource',
      service_territory_location: 'standard:service_territory_location',
      service_territory_member: 'standard:service_territory_member',
      service_territory: 'standard:service_territory',
      shipment: 'standard:shipment',
      skill_entity: 'standard:skill_entity',
      skill_requirement: 'standard:skill_requirement',
      skill: 'standard:skill',
      sms: 'standard:sms',
      snippet: 'standard:snippet',
      sobject_collection: 'standard:sobject_collection',
      sobject: 'standard:sobject',
      social: 'standard:social',
      solution: 'standard:solution',
      sort: 'standard:sort',
      sossession: 'standard:sossession',
      stage_collection: 'standard:stage_collection',
      stage: 'standard:stage',
      steps: 'standard:steps',
      strategy: 'standard:strategy',
      survey: 'standard:survey',
      system_and_global_variable: 'standard:system_and_global_variable',
      task: 'standard:task',
      task2: 'standard:task2',
      team_member: 'standard:team_member',
      template: 'standard:template',
      text_template: 'standard:text_template',
      text: 'standard:text',
      textarea: 'standard:textarea',
      textbox: 'standard:textbox',
      thanks_loading: 'standard:thanks_loading',
      thanks: 'standard:thanks',
      timesheet_entry: 'standard:timesheet_entry',
      timesheet: 'standard:timesheet',
      timeslot: 'standard:timeslot',
      today: 'standard:today',
      topic: 'standard:topic',
      topic2: 'standard:topic2',
      trailhead: 'standard:trailhead',
      unmatched: 'standard:unmatched',
      user_role: 'standard:user_role',
      user: 'standard:user',
      variable: 'standard:variable',
      visits: 'standard:visits',
      waits: 'standard:waits',
      work_capacity_limit: 'standard:work_capacity_limit',
      work_capacity_usage: 'standard:work_capacity_usage',
      work_order_item: 'standard:work_order_item',
      work_order: 'standard:work_order',
      work_queue: 'standard:work_queue',
      work_type_group: 'standard:work_type_group',
      work_type: 'standard:work_type'
    }
    return icons[sObjectType] || 'standard:default'
  }
}