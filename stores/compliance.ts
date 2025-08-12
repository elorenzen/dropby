import { defineStore } from 'pinia'

export interface ComplianceDocument {
  id: string
  business_id: string
  business_type: 'vendor' | 'merchant'
  category: string
  title: string
  document_type?: string
  
  // Document Identification Fields
  document_number?: string           // The actual license/permit number issued
  certificate_id?: string            // Certificate ID if different from document number
  license_id?: string                // License ID if different from document number
  permit_id?: string                 // Permit ID if different from document number
  
  // Issuing Authority Information
  issuing_authority?: string         // Who issued the document
  authority_contact?: string         // Contact info for issuing authority
  authority_website?: string         // Website for verification
  
  // Document Dates
  issue_date?: string                // When document was issued
  expiry_date?: string               // When document expires
  renewal_date?: string              // When document should be renewed
  
  // File Storage
  file_path?: string                 // Internal file path
  storage_url?: string               // Public storage URL for viewing
  
  // Document Details
  notes?: string                     // Additional notes
  verification_notes?: string        // Admin verification notes
  
  // Status and Verification
  status: string                     // pending/verified/rejected/expired
  verified: boolean
  verified_by?: string
  verified_at?: string
  
  // Business Requirements
  required: boolean                  // Whether this document is required for business type
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface ComplianceRequirement {
  id: string
  business_type: 'vendor' | 'merchant'
  category: string
  title: string
  description: string
  required: boolean
  order_index: number
}

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
        { id: 'business_license', business_type: 'vendor', category: 'business_license', title: 'Business License', description: 'State or local business license', required: true, order_index: 1 },
        { id: 'health_permit', business_type: 'vendor', category: 'health_permit', title: 'Health Permit', description: 'County health department permit', required: true, order_index: 2 },
        { id: 'health_inspection', business_type: 'vendor', category: 'health_inspection', title: 'Health Inspection Grade', description: 'Current health inspection grade/certificate', required: true, order_index: 3 },
        { id: 'servsafe_manager', business_type: 'vendor', category: 'servsafe_manager', title: 'Manager ServSafe Certificate', description: 'Manager-level food safety certification', required: true, order_index: 4 },
        { id: 'insurance', business_type: 'vendor', category: 'insurance', title: 'Insurance Certificate', description: 'General liability and vehicle insurance', required: true, order_index: 5 },
        { id: 'vehicle_registration', business_type: 'vendor', category: 'vehicle_registration', title: 'Vehicle Registration', description: 'Food truck vehicle registration', required: true, order_index: 6 }
      ]
    } else {
      return [
        { id: 'business_license', business_type: 'merchant', category: 'business_license', title: 'Business License', description: 'State or local business license', required: true, order_index: 1 },
        { id: 'health_permit', business_type: 'merchant', category: 'health_permit', title: 'Health Permit', description: 'County health department permit', required: true, order_index: 2 },
        { id: 'health_inspection', business_type: 'merchant', category: 'health_inspection', title: 'Health Inspection Grade', description: 'Current health inspection grade/certificate', required: true, order_index: 3 },
        { id: 'insurance', business_type: 'merchant', category: 'insurance', title: 'Insurance Certificate', description: 'General liability insurance', required: true, order_index: 4 },
        { id: 'fire_safety', business_type: 'merchant', category: 'fire_safety', title: 'Fire Safety Certificate', description: 'Fire department safety inspection', required: true, order_index: 5 }
      ]
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
