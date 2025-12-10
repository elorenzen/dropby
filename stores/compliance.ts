import { defineStore } from 'pinia'
import type { ComplianceDocument, ComplianceRequirement } from '~/types'

export interface ExpiryNotification {
  documentId: string
  documentTitle: string
  businessId: string
  businessType: 'vendor' | 'merchant'
  daysUntilExpiry: number
  isExpired: boolean
  severity: 'warning' | 'urgent' | 'expired'
}

export const useComplianceStore = defineStore('compliance', () => {
  const supabase = useSupabaseClient()
  const userStore = useUserStore()

  // State
  const documents = ref<ComplianceDocument[]>([])
  const requirements = ref<ComplianceRequirement[]>([])
  const loading = ref(false)
  const uploading = ref(false)

  // Getters
  const isAdmin = computed(() => userStore.user?.is_admin || false)
  
  const userDocuments = computed(() => {
    if (isAdmin.value) return documents.value
    return documents.value.filter(doc => 
      doc.business_id === userStore.user?.associated_vendor_id || 
      doc.business_id === userStore.user?.associated_merchant_id
    )
  })

  const pendingDocuments = computed(() => 
    documents.value.filter(doc => doc.status === 'pending')
  )

  const verifiedDocuments = computed(() => 
    documents.value.filter(doc => doc.verified && !isDocumentExpired(doc))
  )

  const expiredDocuments = computed(() => 
    documents.value.filter(doc => isDocumentExpired(doc))
  )

  const expiringSoonDocuments = computed(() => 
    documents.value.filter(doc => isDocumentExpiringSoon(doc))
  )

  const validDocuments = computed(() => 
    documents.value.filter(doc => doc.verified && !isDocumentExpired(doc))
  )

  // Enhanced compliance score - only counts valid documents
  const complianceScore = computed(() => {
    // Get required categories from requirements table
    const requiredCategories = requirements.value.filter(req => req.required).map(req => req.category)
    if (requiredCategories.length === 0) return 0
    
    // Count how many required categories have valid documents
    let validRequiredCount = 0
    
    for (const category of requiredCategories) {
      const categoryDocs = documents.value.filter(doc => doc.category === category)
      const hasValidDoc = categoryDocs.some(doc => doc.verified && !isDocumentExpired(doc))
      if (hasValidDoc) {
        validRequiredCount++
      }
    }
    
    return Math.round((validRequiredCount / requiredCategories.length) * 100)
  })

  // Check if document is expired
  const isDocumentExpired = (document: ComplianceDocument): boolean => {
    if (!document.expiry_date) return false
    return new Date(document.expiry_date) < new Date()
  }

  // Check if document is expiring soon (within 30 days)
  const isDocumentExpiringSoon = (document: ComplianceDocument): boolean => {
    if (!document.expiry_date) return false
    const expiryDate = new Date(document.expiry_date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate < thirtyDaysFromNow && expiryDate > new Date()
  }

  // Get days until expiry
  const getDaysUntilExpiry = (document: ComplianceDocument): number => {
    if (!document.expiry_date) return Infinity
    const expiryDate = new Date(document.expiry_date)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Get expiry notification severity
  const getExpirySeverity = (document: ComplianceDocument): 'warning' | 'urgent' | 'expired' => {
    if (isDocumentExpired(document)) return 'expired'
    const daysUntil = getDaysUntilExpiry(document)
    if (daysUntil <= 7) return 'urgent'
    if (daysUntil <= 30) return 'warning'
    return 'warning'
  }

  // Get all expiry notifications for a business
  const getExpiryNotifications = (businessId?: string): ExpiryNotification[] => {
    const docs = businessId 
      ? documents.value.filter(d => d.business_id === businessId)
      : documents.value

    return docs
      .filter(doc => doc.expiry_date && (isDocumentExpired(doc) || isDocumentExpiringSoon(doc)))
      .map(doc => ({
        documentId: doc.id,
        documentTitle: doc.title,
        businessId: doc.business_id,
        businessType: doc.business_type,
        daysUntilExpiry: getDaysUntilExpiry(doc),
        isExpired: isDocumentExpired(doc),
        severity: getExpirySeverity(doc)
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  }

  // Check if business can operate (has all required valid documents)
  const canBusinessOperate = computed(() => {
    // Get required categories from requirements table
    const requiredCategories = requirements.value.filter(req => req.required).map(req => req.category)
    if (requiredCategories.length === 0) return true
    
    // Check if all required categories have valid documents
    for (const category of requiredCategories) {
      const categoryDocs = documents.value.filter(doc => doc.category === category)
      const hasValidDoc = categoryDocs.some(doc => doc.verified && !isDocumentExpired(doc))
      if (!hasValidDoc) {
        return false
      }
    }
    
    return true
  })

  // Check if business can create events (compliance + business rules)
  const canBusinessCreateEvents = computed(() => {
    // Must have all required documents verified and valid
    if (!canBusinessOperate.value) return false
    
    // Additional business rules can be added here
    // For example: minimum compliance score, business verification status, etc.
    
    return true
  })

  // Get compliance status summary
  const complianceStatus = computed(() => {
    const total = documents.value.length
    const verified = verifiedDocuments.value.length
    const expired = expiredDocuments.value.length
    const expiringSoon = expiringSoonDocuments.value.length
    const pending = pendingDocuments.value.length

    return {
      total,
      verified,
      expired,
      expiringSoon,
      pending,
      score: complianceScore.value,
      canOperate: canBusinessOperate.value,
      canCreateEvents: canBusinessCreateEvents.value
    }
  })

  // Actions
  const loadRequirements = async (businessType: 'vendor' | 'merchant') => {
    try {
      const { data, error } = await supabase
        .from('compliance_requirements')
        .select('*')
        .eq('business_type', businessType)
        .order('order_index')

      if (error) throw error
      requirements.value = data || []
    } catch (error) {
      console.error('Error loading compliance requirements:', error)
      // Fallback to default requirements
      requirements.value = getDefaultRequirements(businessType)
    }
  }

  const loadDocuments = async (businessId?: string) => {
    loading.value = true
    try {
      let query = supabase
        .from('compliance_documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (businessId) {
        query = query.eq('business_id', businessId)
      } else if (!isAdmin.value) {
        // Regular users can only see their own documents
        const userBusinessId = userStore.user?.associated_vendor_id || userStore.user?.associated_merchant_id
        if (userBusinessId) {
          query = query.eq('business_id', userBusinessId)
        }
      }

      const { data, error } = await query
      if (error) throw error
      documents.value = data || []
    } catch (error) {
      console.error('Error loading compliance documents:', error)
    } finally {
      loading.value = false
    }
  }

  const uploadDocument = async (
    businessId: string,
    businessType: 'vendor' | 'merchant',
    category: string,
    title: string,
    file: File,
    metadata: {
      document_type?: string
      document_number?: string
      certificate_id?: string
      license_id?: string
      permit_id?: string
      issuing_authority?: string
      authority_contact?: string
      authority_website?: string
      issue_date?: string
      expiry_date?: string
      renewal_date?: string
      notes?: string
    }
  ) => {
    uploading.value = true
    try {
      // Upload file to storage
      const fileName = `${businessId}/${category}_${Date.now()}.pdf`
      const { data: fileData, error: fileError } = await supabase.storage
        .from('compliance_documents')
        .upload(fileName, file)

      if (fileError) throw fileError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('compliance_documents')
        .getPublicUrl(fileName)

      // Create document record
      const { error: dbError } = await supabase
        .from('compliance_documents')
        .insert({
          business_id: businessId,
          business_type: businessType,
          category,
          title,
          file_path: fileData.path,
          storage_url: urlData.publicUrl,
          status: 'pending',
          verified: false,

          ...metadata
        })

      if (dbError) throw dbError

      // Create timeline item for document upload
      const timelineStore = useTimelineStore()
      await timelineStore.createTimelineItem({
        owner_id: businessId,
        other_ids: [businessId], // We'll need to get the actual document ID from the insert
        title: 'Compliance Document Uploaded',
        description: `Uploaded ${title} for ${businessType}`,
        type: 'compliance_uploaded'
      })

      // Reload documents
      await loadDocuments(businessId)
      return true
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    } finally {
      uploading.value = false
    }
  }

  const verifyDocument = async (
    documentId: string,
    verified: boolean,
    notes?: string
  ) => {
    if (!isAdmin.value) {
      throw new Error('Only admins can verify documents')
    }

    try {
      const { data, error } = await supabase
        .from('compliance_documents')
        .update({
          verified,
          verified_by: userStore.user?.id,
          verified_at: new Date().toISOString(),
          verification_notes: notes,
          status: verified ? 'verified' : 'rejected'
        } as any)
        .eq('id', documentId)
        .select()

      if (error) throw error

      // Update business compliance status if needed
      if (data?.[0]) {
        await updateBusinessCompliance(data[0])
        
        // Create timeline item for document verification
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data[0].business_id,
          other_ids: [documentId, userStore.user?.id || ''],
          title: 'Compliance Document Verified',
          description: `Document ${data[0].title} has been verified`,
          type: 'compliance_verified'
        })
        
        // Create notification for business owner
        const userStore = useUserStore()
        const businessUserIds = await userStore.getUserIdsFromBusiness(data[0].business_id, data[0].business_type)
        const notificationStore = useNotificationStore()
        
        for (const userId of businessUserIds) {
          await notificationStore.createNotification({
            recipient_id: userId,
            sender_id: userStore.user?.id || null,
            action_type: verified ? 'compliance_verified' : 'compliance_rejected',
            entity_type: 'compliance',
            entity_id: documentId,
            title: verified ? 'Compliance Document Verified' : 'Compliance Document Rejected',
            message: verified 
              ? `Your ${data[0].title} document has been verified`
              : `Your ${data[0].title} document was rejected${notes ? ': ' + notes : ''}`,
            metadata: {
              document_id: documentId,
              document_title: data[0].title,
              business_id: data[0].business_id,
              business_type: data[0].business_type,
              verification_notes: notes
            }
          })
        }
      }

      // Reload documents
      await loadDocuments()
      return data?.[0]
    } catch (error) {
      console.error('Error verifying document:', error)
      throw error
    }
  }

  const updateBusinessCompliance = async (document: ComplianceDocument) => {
    try {
      // Get all documents for this business
      const { data: allDocs } = await supabase
        .from('compliance_documents')
        .select('verified, required, expiry_date')
        .eq('business_id', document.business_id)
        .eq('business_type', document.business_type)

      if (allDocs) {
        // Only count valid (verified and not expired) required documents
        const requiredDocs = allDocs.filter(doc => doc.required)
        const validRequiredDocs = requiredDocs.filter(doc => 
          doc.verified && !isDocumentExpired({ ...document, expiry_date: doc.expiry_date })
        )
        
        const complianceScore = requiredDocs.length > 0 
          ? Math.round((validRequiredDocs.length / requiredDocs.length) * 100)
          : 0
        
        const allRequiredValid = requiredDocs.length > 0 && 
          validRequiredDocs.length === requiredDocs.length

        // Update business table
        const tableName = document.business_type === 'vendor' ? 'vendors' : 'merchants'
        await supabase
          .from(tableName)
          .update({ 
            compliance_verified: allRequiredValid,
            compliance_verified_at: allRequiredValid ? new Date().toISOString() : null,
            compliance_score: complianceScore
          } as any)
          .eq('id', document.business_id)
      }
    } catch (error) {
      console.error('Error updating business compliance:', error)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      // Only allow deletion if user owns the document or is admin
      const document = documents.value.find(d => d.id === documentId)
      if (!document) throw new Error('Document not found')

      const canDelete = isAdmin.value || 
        document.business_id === userStore.user?.associated_vendor_id ||
        document.business_id === userStore.user?.associated_merchant_id

      if (!canDelete) {
        throw new Error('You can only delete your own documents')
      }

      const { error } = await supabase
        .from('compliance_documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      // Reload documents
      await loadDocuments()
      return true
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  // Helper function for default requirements
  const getDefaultRequirements = (businessType: 'vendor' | 'merchant'): ComplianceRequirement[] => {
    if (businessType === 'vendor') {
      return [
        { id: 'business_license', business_type: 'vendor', category: 'business_license', title: 'Business License', description: 'Register your food truck as a legitimate business entity (LLC or other business structure)', required: true, order_index: 1 },
        { id: 'ein', business_type: 'vendor', category: 'ein', title: 'Employer Identification Number (EIN)', description: 'Obtain this from the IRS for tax purposes', required: true, order_index: 2 },
        { id: 'mobile_food_vendor_license', business_type: 'vendor', category: 'mobile_food_vendor_license', title: 'Mobile Food Vendor License (MFVL)', description: 'Required to sell food on public property. This license varies by municipality', required: true, order_index: 3 },
        { id: 'vehicle_registration', business_type: 'vendor', category: 'vehicle_registration', title: 'Vehicle Registration', description: 'Ensure your food truck is properly registered with the state', required: true, order_index: 4 },
        { id: 'food_handlers_permit', business_type: 'vendor', category: 'food_handlers_permit', title: 'Food Handler\'s Permit', description: 'Certification that you understand food safety practices', required: true, order_index: 5 },
        { id: 'health_department_permit', business_type: 'vendor', category: 'health_department_permit', title: 'Health Department Permit', description: 'Required to ensure your food truck meets health and safety regulations', required: true, order_index: 6 },
        { id: 'commissary_agreement', business_type: 'vendor', category: 'commissary_agreement', title: 'Commissary Agreement', description: 'If you prepare food in a separate location, you may need an agreement with that facility', required: false, order_index: 7 },
        { id: 'liability_insurance', business_type: 'vendor', category: 'liability_insurance', title: 'Liability Insurance', description: 'Liability insurance to protect your business and comply with local regulations', required: true, order_index: 8 },
        { id: 'parking_permits', business_type: 'vendor', category: 'parking_permits', title: 'Parking Permits', description: 'Depending on your location, you may need specific permits for where you can park and operate your food truck', required: false, order_index: 9 }
      ] as ComplianceRequirement[]
    } else {
      // Merchants (Breweries, Wine Bars, Brewpubs, etc.)
      return [
        { id: 'business_license', business_type: 'merchant', category: 'business_license', title: 'Business License', description: 'Proof of business structure (e.g., LLC, corporation)', required: true, order_index: 1 },
        { id: 'ein', business_type: 'merchant', category: 'ein', title: 'Employer Identification Number (EIN)', description: 'Required for tax purposes', required: true, order_index: 2 },
        { id: 'certificate_of_occupancy', business_type: 'merchant', category: 'certificate_of_occupancy', title: 'Certificate of Occupancy', description: 'Confirms the business location meets local zoning laws', required: true, order_index: 3 },
        { id: 'federal_brewers_notice', business_type: 'merchant', category: 'federal_brewers_notice', title: 'Federal Brewer\'s Notice', description: 'Required for breweries to operate legally under federal law', required: false, order_index: 4 },
        { id: 'state_brewery_permit', business_type: 'merchant', category: 'state_brewery_permit', title: 'State Brewery Permit', description: 'Issued by the Texas Alcoholic Beverage Commission (TABC) for manufacturing beer', required: false, order_index: 5 },
        { id: 'wine_beer_retailer_bg', business_type: 'merchant', category: 'wine_beer_retailer_bg', title: 'Wine and Beer Retailer\'s Permit (BG)', description: 'Allows selling beer and wine for on-premises consumption (e.g., bars, restaurants)', required: false, order_index: 6 },
        { id: 'wine_beer_retailer_bq', business_type: 'merchant', category: 'wine_beer_retailer_bq', title: 'Wine and Beer Retailer\'s Off-Premise Permit (BQ)', description: 'Required for retail sales where consumption is not allowed on-site (e.g., grocery stores)', required: false, order_index: 7 },
        { id: 'brewpub_license', business_type: 'merchant', category: 'brewpub_license', title: 'Brewpub License', description: 'Necessary if selling beer on-site at a brewery', required: false, order_index: 8 },
        { id: 'liability_insurance', business_type: 'merchant', category: 'liability_insurance', title: 'Liability Insurance', description: 'General liability insurance to protect your business', required: true, order_index: 9 },
        { id: 'fire_safety', business_type: 'merchant', category: 'fire_safety', title: 'Fire Safety Certificate', description: 'Fire department safety inspection for fixed establishment', required: true, order_index: 10 }
      ] as ComplianceRequirement[]
    }
  }

  return {
    // State
    documents,
    requirements,
    loading,
    uploading,
    
    // Getters
    isAdmin,
    userDocuments,
    pendingDocuments,
    verifiedDocuments,
    expiredDocuments,
    expiringSoonDocuments,
    validDocuments,
    complianceScore,
    canBusinessOperate,
    canBusinessCreateEvents,
    complianceStatus,
    
    // Utility functions
    isDocumentExpired,
    isDocumentExpiringSoon,
    getDaysUntilExpiry,
    getExpirySeverity,
    getExpiryNotifications,
    
    // Actions
    loadRequirements,
    loadDocuments,
    uploadDocument,
    verifyDocument,
    deleteDocument
  }
})
