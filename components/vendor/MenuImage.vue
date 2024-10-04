<script setup>
const props = defineProps(['path', 'menuId'])
const menuId = ref(props.menuId)
const { path } = toRefs(props)

const emit = defineEmits(['update:path', 'upload'])

const supabase = useSupabaseClient()

const uploading = ref(false)
const src = ref('')
const files = ref()

const downloadImage = async () => {
  try {
    const { data, error } = await supabase.storage.from('menu_images').download(path.value)
    if (error) throw error
    src.value = URL.createObjectURL(data)
  } catch (error) {
    console.error('Error downloading image: ', error.message)
  }
}

const uploadImage = async (evt) => {
  files.value = evt.target.files
  try {
    uploading.value = true

    if (!files.value || files.value.length === 0) {
      throw new Error('You must select an image to upload.')
    }

    const file = files.value[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${menuId.value}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from('menu_images').upload(filePath, file)

    if (uploadError) console.error(uploadError)
    else {
      const { data } = supabase.storage.from('menu_images').getPublicUrl(filePath)
      emit('upload', { path: data.publicUrl, id: menuId.value })
    }

    emit('update:path', filePath)
  } catch (error) {
    alert(error.message)
  } finally {
    uploading.value = false
  }
}

downloadImage()

watch(path, () => {
  if (path.value) {
    downloadImage()
  }
})
</script>

<template>
  <div>
    <img
      v-if="src"
      :src="src"
      alt="Avatar"
      class="avatar image"
      style="width: 10em; height: 10em;"
    />
    <div v-else class="avatar no-image" :style="{ height: size, width: size }" />

    <div style="width: 10em; position: relative;">
      <v-file-input
        :label="uploading ? 'Uploading ...' : 'Upload'"
        @change="uploadImage"
        :disabled="uploading"
      ></v-file-input>
    </div>
  </div>
</template>