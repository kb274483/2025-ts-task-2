<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { Modal } from 'bootstrap'
import type { Coupon, CreateCouponParams } from '@/types/coupon'
import { apiCreateCoupon, apiEditCoupon } from '@/api/coupon'
import { formatDate } from '@/utils/date'

interface Props {
  coupon?: Coupon
}

const props = defineProps<Props>()
const emit = defineEmits(['update'])

const modalRef = useTemplateRef<HTMLElement>('modalRef')
let modal: Modal | null = null

const form = ref<CreateCouponParams>({
  title: '',
  is_enabled: 1,
  percent: 10,
  due_date: new Date().getTime() / 1000,
  code: '',
})

const isLoading = ref(false)
const dueDateStr = ref('')

onMounted(() => {
  if (modalRef.value) {
    modal = new Modal(modalRef.value)
  }
})

onUnmounted(() => {
  modal?.dispose()
})

const openModal = () => {
  modal?.show()
}

const closeModal = () => {
  modal?.hide()
}

watch(
  () => props.coupon,
  (newCoupon) => {
    if (newCoupon) {
      // 編輯模式
      form.value = {
        title: newCoupon.title,
        is_enabled: newCoupon.is_enabled,
        percent: newCoupon.percent,
        due_date: newCoupon.due_date,
        code: newCoupon.code,
      }
      dueDateStr.value = formatDate(newCoupon.due_date)
    } else {
      // 新增模式
      const now = new Date()
      form.value = {
        title: '',
        is_enabled: 1,
        percent: 100,
        due_date: Math.floor(now.getTime() / 1000),
        code: '',
      }
      dueDateStr.value = formatDate(Math.floor(now.getTime() / 1000))
    }
  },
  { deep: true },
)

const submit = async () => {
  isLoading.value = true
  try {
    if (form.value.percent < 1 || form.value.percent > 100) {
      alert('折扣百分比必須在 1% 到 100% 之間')
      return
    }
    const timestamp = Math.floor(new Date(dueDateStr.value).getTime() / 1000)
    form.value.due_date = timestamp

    if (props.coupon?.id) {
      await apiEditCoupon({
        id: props.coupon.id,
        data: form.value,
      })
    } else {
      await apiCreateCoupon(form.value)
    }
    emit('update')
    closeModal()
  } catch (error) {
    console.error(error)
    alert('操作失敗')
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  openModal,
  closeModal,
})
</script>

<template>
  <div
    class="modal fade"
    id="couponModal"
    tabindex="-1"
    aria-labelledby="couponModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title" id="couponModalLabel">
            {{ coupon?.id ? '編輯優惠券' : '新增優惠券' }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label for="title" class="form-label">標題</label>
              <input
                type="text"
                class="form-control"
                id="title"
                v-model="form.title"
                placeholder="請輸入標題"
                required
              />
            </div>
            <div class="mb-3">
              <label for="code" class="form-label">優惠碼</label>
              <input
                type="text"
                class="form-control"
                id="code"
                v-model="form.code"
                placeholder="請輸入優惠碼"
                required
              />
            </div>
            <div class="mb-3">
              <label for="due_date" class="form-label">到期日</label>
              <input type="date" class="form-control" id="due_date" v-model="dueDateStr" required />
            </div>
            <div class="mb-3">
              <label for="percent" class="form-label">折扣百分比 (%)</label>
              <input
                type="number"
                class="form-control"
                id="percent"
                v-model="form.percent"
                placeholder="請輸入折扣百分比"
                min="0"
                max="100"
                required
              />
            </div>
            <div class="mb-3">
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="is_enabled"
                  :true-value="1"
                  :false-value="0"
                  v-model="form.is_enabled"
                />
                <label class="form-check-label" for="is_enabled">是否啟用</label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button type="button" class="btn btn-dark" @click="submit" :disabled="isLoading">
            {{ isLoading ? '儲存中...' : '確認' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

