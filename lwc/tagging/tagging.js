/* eslint-disable no-console */
/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api, track, wire } from 'lwc'
import deleteTagging from '@salesforce/apex/Tagging.deleteTagging'
import insertTagging from '@salesforce/apex/Tagging.insertTagging'
import getRecordTags from '@salesforce/apex/Tagging.getRecordTags'
import queryTags from '@salesforce/apex/Tagging.queryTags'
import insertTagAndTagging from '@salesforce/apex/Tagging.insertTagAndTagging'
import { CurrentPageReference } from 'lightning/navigation'
import { fireEvent } from 'c/pubsub'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

const DELAY = 300
export default class Tagging extends LightningElement {
  @api recordId
  @api objectApiName

  timeoutId
  @track queryValue
  @track currentTags = []
  @track tags = []
  @track relatedTagId
  currentTagIds = new Set()

  @wire(CurrentPageReference) pageRef

  constructor() {
    super()

    this.template.addEventListener('keyup', e => {
      if (e.key === 'Enter' && this.tags.length === 1) {
        this.handlePillQuerySelect(this.tags[0].name)
        this.clearQueryData()
        return
      }
      if (e.key === 'Enter' && this.tags.length === 0) {
        this.createTagAndTagging()
        this.clearQueryData()
      }
    })
  }

  showErrorToast(message) {
    const evt = new ShowToastEvent({
      title: 'There was an error.',
      message: message,
      variant: 'error'
    })
    this.dispatchEvent(evt)
  }

  clearQueryData() {
    this.queryValue = null
    this.tags = []
  }

  connectedCallback() {
    this.getCurrentTags()
  }

  handlePillQueryClick(e) {
    e.preventDefault()
    const tagId = e.target.name
    this.handlePillQuerySelect(tagId)
  }

  async handlePillQuerySelect(tagId) {
    try {
      const { recordId, objectApiName } = this
      await insertTagging({ tagId, recordId, objectApiName })
      this.clearQueryData()
      this.getCurrentTags()
    } catch (error) {
      console.log('error: ', JSON.stringify(error, null, 2))
    }
  }

  async getCurrentTags() {
    try {
      const newTagData = await getRecordTags({
        recordId: this.recordId
      })
      if (newTagData) {
        this.currentTags = newTagData.map(t => ({
          label: t.UniTag__Tag__r.Name,
          name: t.UniTag__Tag__r.Id
        }))
        this.currentTagIds = new Set(newTagData.map(t => t.UniTag__Tag__r.Id))
      }
    } catch (error) {
      console.log('error: ', JSON.stringify(error, null, 2))
      this.showErrorToast(error.body.message)
    }
  }

  async handleRemoveTag(e) {
    e.preventDefault()
    try {
      e.target.classList.add('fade-pill')
      const tagId = e.target.name
      const { recordId } = this
      await deleteTagging({ tagId, recordId })
      this.getCurrentTags()
    } catch (error) {
      e.target.classList.remove('fade-pill')
      console.log('error: ', JSON.stringify(error, null, 2))
    }
  }

  async createTagAndTagging() {
    try {
      const { recordId, objectApiName } = this
      const tagName = this.template.querySelector('lightning-input').value
      await insertTagAndTagging({ tagName, recordId, objectApiName })
      this.getCurrentTags()
      this.tags = []
      this.queryValue = ''
    } catch (error) {
      console.log('error: ', JSON.stringify(error, null, 2))
    }
  }

  handleCurrentTagClick(e) {
    e.preventDefault()
    const tagId = e.target.name
    const tagLabel = e.target.label
    this.relatedTagId = tagId
    fireEvent(this.pageRef, 'listRelatedTagged', { tagId, tagLabel })
  }

  async handleInputChange(e) {
    const query = e.target.value
    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(async () => {
      try {
        if (!query.length) {
          this.clearQueryData()
          return
        }
        if (query.length < 3) return
        const tags = await queryTags({ query })
        this.tags = tags
          .filter(t => !this.currentTagIds.has(t.Id))
          .map(t => ({ label: t.Name, name: t.Id }))
      } catch (error) {
        console.error(JSON.stringify(error, null, 2))
      }
    }, DELAY)
  }
}