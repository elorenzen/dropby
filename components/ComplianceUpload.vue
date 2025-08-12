<template>
  <div class="compliance-upload">
    <Card>
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <i class="pi pi-shield text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-text-main">Business Compliance</h3>
            <p class="text-sm text-text-muted">Upload required documents for verification</p>
          </div>
        </div>
      </template>
      
      <template #content>
        <div class="space-y-6">
          <!-- Document Categories -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="category in documentCategories" 
              :key="category.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <i class="pi pi-file-pdf text-gray-600 dark:text-gray-400"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-text-main">{{ category.title }}</h4>
                    <p class="text-sm text-text-muted">{{ category.description }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <Tag 
                        :value="getDocumentStatus(category.id)" 
                        :severity="getDocumentStatusSeverity(category.id)"
                        size="small"
                      />
                      <span v-if="getDocumentExpiry(category.id)" class="text-xs text-text-muted">
                        Expires: {{ formatDate(getDocumentExpiry(category.id)) }}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  :label="getDocumentStatus(category.id) === 'Uploaded' ? 'Update' : 'Upload'"
                  :severity="getDocumentStatus(category.id) === 'Uploaded' ? 'secondary' : 'primary'"
                  size="small"
                  outlined
                  @click="openUploadDialog(category)"
                />
              </div>
            </div>
          </div>

          <!-- Compliance Summary -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium text-text-main mb-3">Compliance Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ complianceStore.complianceScore }}%
                </div>
                <div class="text-text-muted">Compliance Score</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {{ complianceStore.pendingDocuments.length }}
                </div>
                <div class="text-text-muted">Pending</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                  {{ complianceStore.expiredDocuments.length }}
                </div>
                <div class="text-text-muted">Expired</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ complianceStore.verifiedDocuments.length }}
                </div>
                <div class="text-text-muted">Verified</div>
              </div>
            </div>
            
            <!-- Operation Status -->
            <div class="mt-4 p-3 rounded-lg" :class="complianceStore.canBusinessOperate ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
              <div class="flex items-center gap-2">
                <i :class="complianceStore.canBusinessOperate ? 'pi pi-check-circle text-green-600' : 'pi pi-times-circle text-red-600'"></i>
                <span class="font-medium" :class="complianceStore.canBusinessOperate ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
                  {{ complianceStore.canBusinessOperate ? 'Business Can Operate' : 'Business Cannot Operate' }}
                </span>
              </div>
              <p class="text-sm mt-1" :class="complianceStore.canBusinessOperate ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                {{ complianceStore.canBusinessOperate ? 'All required documents are valid and verified' : 'Some required documents are missing, expired, or unverified' }}
              </p>
            </div>
          </div>

          <!-- Expiry Notifications -->
          <div v-if="complianceStore.getExpiryNotifications(props.businessId).length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium text-text-main mb-3">⚠️ Document Expiry Alerts</h4>
            <div class="space-y-2">
              <div 
                v-for="notification in complianceStore.getExpiryNotifications(props.businessId)" 
                :key="notification.documentId"
                class="flex items-center justify-between p-3 rounded-lg"
                :class="{
                  'bg-red-100 dark:bg-red-900/30': notification.severity === 'expired',
                  'bg-orange-100 dark:bg-orange-900/30': notification.severity === 'urgent',
                  'bg-yellow-100 dark:bg-yellow-900/30': notification.severity === 'warning'
                }"
              >
                <div class="flex items-center gap-3">
                  <i :class="{
                    'pi pi-exclamation-triangle text-red-600': notification.severity === 'expired',
                    'pi pi-exclamation-circle text-orange-600': notification.severity === 'urgent',
                    'pi pi-info-circle text-yellow-600': notification.severity === 'warning'
                  }"></i>
                  <div>
                    <div class="font-medium text-text-main">{{ notification.documentTitle }}</div>
                    <div class="text-sm text-text-muted">
                      {{ notification.isExpired ? 'Expired' : `Expires in ${notification.daysUntilExpiry} days` }}
                    </div>
                  </div>
                </div>
                <Tag 
                  :value="notification.severity === 'expired' ? 'EXPIRED' : notification.severity === 'urgent' ? 'URGENT' : 'WARNING'"
                  :severity="notification.severity === 'expired' ? 'danger' : notification.severity === 'urgent' ? 'warning' : 'info'"
                  size="small"
                />
              </div>
            </div>
          </div>


        </div>
      </template>
    </Card>

    <!-- Upload Dialog -->
    <Dialog 
      :visible="showUploadDialog" 
      @update:visible="showUploadDialog = $event"
      modal 
      :style="{ width: '90vw', maxWidth: '500px' }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <i class="pi pi-upload text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-text-main">Upload {{ selectedCategory?.title }}</h3>
            <p class="text-sm text-text-muted">Upload your {{ selectedCategory?.title.toLowerCase() }} document</p>
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Document Information -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Document Type</label>
            <InputText 
              v-model="documentInfo.type" 
              :placeholder="selectedCategory?.title"
              class="w-full"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text-main mb-2">Issue Date</label>
              <Calendar 
                v-model="documentInfo.issueDate" 
                :max-date="new Date()"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-main mb-2">Expiry Date</label>
              <Calendar 
                v-model="documentInfo.expiryDate" 
                :min-date="new Date()"
                class="w-full"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Document Number</label>
            <InputText 
              v-model="documentInfo.document_number" 
              placeholder="e.g., LICENSE-12345"
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Issuing Authority</label>
            <InputText 
              v-model="documentInfo.issuing_authority" 
              placeholder="e.g., City Health Department"
              class="w-full"
            />
          </div>
        </div>

        <!-- File Upload -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-text-main">Document File</label>
          <FileUpload
            v-model="uploadedFile"
            mode="basic"
            accept=".pdf,.jpg,.jpeg,.png"
            :maxFileSize="5000000"
            :auto="true"
            chooseLabel="Choose File"
            class="w-full"
            @select="onFileSelect"
          />
          <p class="text-xs text-text-muted">
            Accepted formats: PDF, JPG, PNG (max 5MB)
          </p>
        </div>

        <!-- Additional Notes -->
        <div>
          <label class="block text-sm font-medium text-text-main mb-2">Additional Notes</label>
          <Textarea 
            v-model="documentInfo.notes" 
            rows="3" 
            placeholder="Any additional information about this document..."
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button 
            label="Cancel" 
            severity="secondary" 
            outlined
            @click="closeUploadDialog" 
          />
          <Button 
            label="Upload Document" 
            @click="uploadDocument"
            :loading="uploading"
            :disabled="!uploadedFile"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

interface DocumentCategory {
  id: string
  title: string
  description: string
  required: boolean
  category: string
  business_type: 'merchant' | 'vendor'
  order_index: number
}

interface DocumentInfo {
  type: string
  document_number: string
  certificate_id: string
  license_id: string
  permit_id: string
  issuing_authority: string
  authority_contact: string
  authority_website: string
  issueDate: Date | null
  expiryDate: Date | null
  renewalDate: Date | null
  notes: string
}

interface Props {
  businessId: string
  businessType: 'merchant' | 'vendor'
}

const props = defineProps<Props>()

const supabase = useSupabaseClient()
const toast = useToast()

// Use compliance store
const complianceStore = useComplianceStore()

// Document categories from store
const documentCategories = computed(() => complianceStore.requirements)
const loadingCategories = computed(() => complianceStore.loading)

// Load compliance requirements for business type
const loadComplianceRequirements = async () => {
  await complianceStore.loadRequirements(props.businessType)
}

// Upload state
const showUploadDialog = ref(false)
const selectedCategory = ref<DocumentCategory | null>(null)
const uploadedFile = ref<File | null>(null)
const uploading = ref(false)
const documentInfo = ref<DocumentInfo>({
  type: '',
  document_number: '',
  certificate_id: '',
  license_id: '',
  permit_id: '',
  issuing_authority: '',
  authority_contact: '',
  authority_website: '',
  issueDate: null,
  expiryDate: null,
  renewalDate: null,
  notes: ''
})

// Load existing documents
const existingDocuments = ref<any[]>([])

const loadDocuments = async () => {
  const { data, error } = await supabase
    .from('compliance_documents')
    .select('*')
    .eq('business_id', props.businessId)
    .eq('business_type', props.businessType)
  
  if (!error && data) {
    existingDocuments.value = data
  }
}

// Helper functions
const getDocumentStatus = (categoryId: string): string => {
  const doc = existingDocuments.value.find(d => d.category === categoryId)
  if (!doc) return 'Not Uploaded'
  if (doc.verified) return 'Verified'
  if (doc.expiry_date && new Date(doc.expiry_date) < new Date()) return 'Expired'
  return 'Uploaded'
}

const getDocumentStatusSeverity = (categoryId: string): string => {
  const status = getDocumentStatus(categoryId)
  switch (status) {
    case 'Verified': return 'success'
    case 'Uploaded': return 'info'
    case 'Expired': return 'danger'
    default: return 'warning'
  }
}

const getDocumentExpiry = (categoryId: string): string | null => {
  const doc = existingDocuments.value.find(d => d.category === categoryId)
  return doc?.expiry_date || null
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

// Computed properties for summary
const completedDocuments = computed(() => {
  return existingDocuments.value.filter(d => d.verified).length
})

const pendingDocuments = computed(() => {
  return existingDocuments.value.filter(d => !d.verified && d.expiry_date && new Date(d.expiry_date) > new Date()).length
})

const expiredDocuments = computed(() => {
  return existingDocuments.value.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length
})

const verifiedDocuments = computed(() => {
  return existingDocuments.value.filter(d => d.verified).length
})

// Dialog functions
const openUploadDialog = (category: DocumentCategory) => {
  selectedCategory.value = category
  documentInfo.value.type = category.title
  showUploadDialog.value = true
}

const closeUploadDialog = () => {
  showUploadDialog.value = false
  selectedCategory.value = null
  uploadedFile.value = null
  documentInfo.value = {
    type: '',
    document_number: '',
    certificate_id: '',
    license_id: '',
    permit_id: '',
    issuing_authority: '',
    authority_contact: '',
    authority_website: '',
    issueDate: null,
    expiryDate: null,
    renewalDate: null,
    notes: ''
  }
}

const onFileSelect = (event: any) => {
  console.log('File selected:', event)
  if (event.files && event.files.length > 0) {
    uploadedFile.value = event.files[0]
    console.log('Uploaded file set to:', uploadedFile.value)
  }
}

const uploadDocument = async () => {
  if (!uploadedFile.value || !selectedCategory.value) return

  try {
    await complianceStore.uploadDocument(
      props.businessId,
      props.businessType,
      selectedCategory.value.id,
      selectedCategory.value.title,
      uploadedFile.value,
      {
        document_type: documentInfo.value.type,
        document_number: documentInfo.value.document_number,
        certificate_id: documentInfo.value.certificate_id,
        license_id: documentInfo.value.license_id,
        permit_id: documentInfo.value.permit_id,
        issuing_authority: documentInfo.value.issuing_authority,
        authority_contact: documentInfo.value.authority_contact,
        authority_website: documentInfo.value.authority_website,
        issue_date: documentInfo.value.issueDate?.toISOString(),
        expiry_date: documentInfo.value.expiryDate?.toISOString(),
        renewal_date: documentInfo.value.renewalDate?.toISOString(),
        notes: documentInfo.value.notes,

      }
    )

    toast.add({
      severity: 'success',
      summary: 'Document Uploaded',
      detail: `${selectedCategory.value.title} has been uploaded successfully`,
      life: 3000
    })

    closeUploadDialog()

  } catch (error) {
    console.error('Upload error:', error)
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: 'Failed to upload document. Please try again.',
      life: 3000
    })
  }
}

// Load documents and requirements on mount
onMounted(async () => {
  // Clear any existing documents for testing
  await clearTestData()
  
  loadComplianceRequirements()
  loadDocuments()
})

// Function to clear test data (for development/testing only)
const clearTestData = async () => {
  try {
    // Clear any existing compliance documents for this business
    const { error } = await supabase
      .from('compliance_documents')
      .delete()
      .eq('business_id', props.businessId)
      .eq('business_type', props.businessType)
    
    if (error) {
      console.log('No existing documents to clear or error:', error)
    } else {
      console.log('Cleared existing test documents')
    }
    
    // Reset local state
    existingDocuments.value = []
  } catch (error) {
    console.log('Error clearing test data:', error)
  }
}
</script>

<style scoped>
.compliance-upload {
  @apply w-full;
}
</style> 