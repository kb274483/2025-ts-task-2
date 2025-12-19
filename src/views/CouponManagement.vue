<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from 'vue'
import { apiGetCoupons, apiDeleteCoupon } from '@/api/coupon'
import type { Coupon, Pagination } from '@/types/coupon'
import { formatDate } from '@/utils/date'
import CouponModal from '@/components/CouponModal.vue'
import DeleteModal from '@/components/DeleteModal.vue'

const coupons = ref<Coupon[]>([])
const pagination = ref<Pagination>({
  total_pages: 0,
  current_page: 0,
  has_pre: false,
  has_next: false,
})
const isLoading = ref(false)
const tempCoupon = ref<Coupon | undefined>(undefined)

const couponModalRef = useTemplateRef<InstanceType<typeof CouponModal>>('couponModalRef')
const deleteModalRef = useTemplateRef<InstanceType<typeof DeleteModal>>('deleteModalRef')

const getCoupons = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await apiGetCoupons(page)
    coupons.value = res.data.coupons
    pagination.value = res.data.pagination
  } catch (error) {
    console.error(error)
    alert('取得優惠券列表失敗')
  } finally {
    isLoading.value = false
  }
}

const openModal = (coupon?: Coupon) => {
  tempCoupon.value = coupon
  couponModalRef.value?.openModal()
}

const openDeleteModal = (coupon: Coupon) => {
  deleteModalRef.value?.openModal(() => handleDelete(coupon.id))
}

const handleDelete = async (id: string) => {
  try {
    await apiDeleteCoupon(id)
    getCoupons(pagination.value.current_page)
  } catch (error) {
    console.error(error)
    alert('刪除優惠券失敗')
  }
}

onMounted(() => {
  getCoupons()
})
</script>

<template>
  <div class="d-flex justify-content-end align-items-center mb-4">
    <button @click="openModal()" type="button" class="btn btn-dark rounded-lg px-4 py-2">
      <i class="fas fa-plus me-2"></i>新增優惠券
    </button>
  </div>
  
  <div class="card shadow-sm rounded-lg flex-grow-1">
    <div class="card-body p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">標題</th>
              <th scope="col">優惠碼</th>
              <th scope="col">折扣百分比</th>
              <th scope="col">到期日</th>
              <th scope="col" class="text-center">啟用</th>
              <th scope="col" class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in coupons" :key="coupon.id">
              <td>{{ coupon.title }}</td>
              <td>{{ coupon.code }}</td>
              <td>{{ coupon.percent }}%</td>
              <td>{{ formatDate(coupon.due_date) }}</td>
              <td class="text-center">
                <span v-if="coupon.is_enabled" class="text-success fw-bold">啟用</span>
                <span v-else class="text-muted">未啟用</span>
              </td>
              <td class="text-center">
                <div class="btn-group">
                  <button
                    @click="openModal(coupon)"
                    type="button"
                    class="btn btn-sm btn-outline-dark"
                  >
                    編輯
                  </button>
                  <button
                    @click="openDeleteModal(coupon)"
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <nav class="d-flex justify-content-center mt-4">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: !pagination.has_pre }">
            <button
              class="page-link"
              @click="getCoupons(pagination.current_page - 1)"
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          <li
            v-for="page in pagination.total_pages"
            :key="page"
            class="page-item"
            :class="{ active: page === pagination.current_page }"
          >
            <button class="page-link" @click="getCoupons(page)">
              {{ page }}
            </button>
          </li>
          <li class="page-item" :class="{ disabled: !pagination.has_next }">
            <button
              class="page-link"
              @click="getCoupons(pagination.current_page + 1)"
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <CouponModal
    ref="couponModalRef"
    :coupon="tempCoupon"
    @update="getCoupons(pagination.current_page)"
  />
  
  <DeleteModal 
    ref="deleteModalRef" 
    title="刪除優惠券" 
    content="確定要刪除此優惠券嗎？刪除後無法恢復。" 
  />
</template>

