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
                    <i :class="category.icon" class="text-gray-600 dark:text-gray-400"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-text-main">{{ category.name }}</h4>
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
                  {{ completedDocuments }}
                </div>
                <div class="text-text-muted">Completed</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {{ pendingDocuments }}
                </div>
                <div class="text-text-muted">Pending</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                  {{ expiredDocuments }}
                </div>
                <div class="text-text-muted">Expired</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ verifiedDocuments }}
                </div>
                <div class="text-text-muted">Verified</div>
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
            <h3 class="text-xl font-semibold text-text-main">Upload {{ selectedCategory?.name }}</h3>
            <p class="text-sm text-text-muted">Upload your {{ selectedCategory?.name.toLowerCase() }} document</p>
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
              :placeholder="selectedCategory?.name"
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
              v-model="documentInfo.number" 
              placeholder="e.g., LICENSE-12345"
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Issuing Authority</label>
            <InputText 
              v-model="documentInfo.authority" 
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
            :disabled="!uploadedFile || !documentInfo.type"
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
  name: string
  description: string
  icon: string
  required: boolean
}

interface DocumentInfo {
  type: string
  issueDate: Date | null
  expiryDate: Date | null
  number: string
  authority: string
  notes: string
}

interface Props {
  businessId: string
  businessType: 'merchant' | 'vendor'
}

const props = defineProps<Props>()

const supabase = useSupabaseClient()
const toast = useToast()

// Document categories
const documentCategories = ref<DocumentCategory[]>([
  {
    id: 'health_permit',
    name: 'Health Permit',
    description: 'Food service health permit or license',
    icon: 'pi pi-certificate',
    required: true
  },
  {
    id: 'business_license',
    name: 'Business License',
    description: 'General business license or registration',
    icon: 'pi pi-briefcase',
    required: true
  },
  {
    id: 'insurance',
    name: 'Insurance Certificate',
    description: 'General liability insurance certificate',
    icon: 'pi pi-shield',
    required: true
  },
  {
    id: 'food_handler',
    name: 'Food Handler Certificate',
    description: 'Food safety certification for staff',
    icon: 'pi pi-user',
    required: false
  },
  {
    id: 'vehicle_license',
    name: 'Vehicle License',
    description: 'Food truck vehicle license and registration',
    icon: 'pi pi-truck',
    required: props.businessType === 'vendor'
  },
  {
    id: 'tax_id',
    name: 'Tax ID/EIN',
    description: 'Employer Identification Number',
    icon: 'pi pi-id-card',
    required: true
  }
])

// Upload state
const showUploadDialog = ref(false)
const selectedCategory = ref<DocumentCategory | null>(null)
const uploadedFile = ref<File | null>(null)
const uploading = ref(false)
const documentInfo = ref<DocumentInfo>({
  type: '',
  issueDate: null,
  expiryDate: null,
  number: '',
  authority: '',
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
  documentInfo.value.type = category.name
  showUploadDialog.value = true
}

const closeUploadDialog = () => {
  showUploadDialog.value = false
  selectedCategory.value = null
  uploadedFile.value = null
  documentInfo.value = {
    type: '',
    issueDate: null,
    expiryDate: null,
    number: '',
    authority: '',
    notes: ''
  }
}

const uploadDocument = async () => {
  if (!uploadedFile.value || !selectedCategory.value) return

  uploading.value = true

  try {
    // Upload file to storage
    const fileName = `${props.businessId}/${selectedCategory.value.id}_${Date.now()}.pdf`
    const { data: fileData, error: fileError } = await supabase.storage
      .from('compliance-documents')
      .upload(fileName, uploadedFile.value)

    if (fileError) throw fileError

    // Create document record
    const { error: dbError } = await supabase
      .from('compliance_documents')
      .insert({
        id: uuidv4(),
        business_id: props.businessId,
        business_type: props.businessType,
        category: selectedCategory.value.id,
        document_type: documentInfo.value.type,
        document_number: documentInfo.value.number,
        issuing_authority: documentInfo.value.authority,
        issue_date: documentInfo.value.issueDate?.toISOString(),
        expiry_date: documentInfo.value.expiryDate?.toISOString(),
        file_path: fileData.path,
        notes: documentInfo.value.notes,
        status: 'pending',
        verified: false
      })

    if (dbError) throw dbError

    // Reload documents
    await loadDocuments()

    toast.add({
      severity: 'success',
      summary: 'Document Uploaded',
      detail: `${selectedCategory.value.name} has been uploaded successfully`,
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
  } finally {
    uploading.value = false
  }
}

// Load documents on mount
onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.compliance-upload {
  @apply w-full;
}
</style> 