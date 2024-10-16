<template>
  <a-layout class="min-h-screen">
    <a-layout-header theme="light" class="bg-gray-800 text-white px-6 py-4" style="margin-bottom:15px ;">
      <a-row type="flex" justify="space-between" align="middle">
        <a-col>
          <a-button type="text" class="text-white">
            <template #icon><MenuOutlined /></template>
          </a-button>
          <h1 class="text-2xl font-bold ml-4 inline-block">POS Terminal</h1>
        </a-col>
        <a-col>
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Search products..."
            class="w-64 mr-4"
            @search="onSearch"
          />
          <a-badge :count="cart.length">
            <ShoppingCartOutlined style="font-size: 24px; color: white;" />
          </a-badge>
        </a-col>
      </a-row>
    </a-layout-header>
    
    <a-layout-content class="p-6 bg-gray-100">
      <a-row :gutter="24">
        <a-col :span="18">
          <a-card class="mb-6" style="margin-bottom:15px ;">
            <a-segmented
              v-model:value="category"
              :options="categories"
              @change="onCategoryChange"
              block
            />
          </a-card>
          <a-row :gutter="[16, 16]" class="flex flex-wrap">
            <a-col 
              v-for="product in filteredProducts" 
              :key="product.name"
              :xs="24" :sm="12" :md="8" :lg="4"
            >
              <a-card hoverable class="product-card">
                <template #cover>
                  <img :src="product.image" :alt="product.name" class="w-full h-40 object-cover" />
                </template>
                <a-card-meta :title="product.name">
                  <template #description>
                    <p class="text-lg font-semibold">${{ product.price.toFixed(2) }}</p>
                    <a-button type="primary" @click="addToCart(product)" block class="mt-2">
                      Add to Cart
                    </a-button>
                  </template>
                </a-card-meta>
              </a-card>
            </a-col>
          </a-row>
        </a-col>
        
        <a-col :span="6">
          <a-card title="Order Summary" class="mb-6" style="margin-bottom:15px ;">
            <a-list :data-source="cart" :item-layout="'horizontal'">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :title="item.name">
                    <template #description>
                      <div class="flex justify-between items-center">
                        <span class="text-lg font-semibold">${{ (item.price * item.quantity).toFixed(2) }}</span>
                        <a-space>
                          <a-button @click="removeFromCart(item)" size="small">-</a-button>
                          <span class="text-lg">{{ item.quantity }}</span>
                          <a-button @click="addToCart(item)" size="small">+</a-button>
                        </a-space>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
          
          <a-card title="Payment Summary">
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="Subtotal">
                ${{ subtotal.toFixed(2) }}
              </a-descriptions-item>
              <a-descriptions-item label="Tax (8%)">
                ${{ tax.toFixed(2) }}
              </a-descriptions-item>
              <a-descriptions-item label="Total">
                <a-typography-text type="danger" strong class="text-xl">
                  ${{ total.toFixed(2) }}
                </a-typography-text>
              </a-descriptions-item>
            </a-descriptions>
            <a-button type="primary" block class="mt-4" style="margin-top: 10px;" @click="showPaymentModal = true">
              Complete Payment
            </a-button>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
  <a-modal v-model:visible="showPaymentModal" title="Select Payment Method" :footer="null" :closable="false">
    <a-descriptions :column="1" bordered>
      <a-descriptions-item label="Subtotal">
        ${{ subtotal.toFixed(2) }}
      </a-descriptions-item>
      <a-descriptions-item label="Tax (8%)">
        ${{ tax.toFixed(2) }}
      </a-descriptions-item>
      <a-descriptions-item label="Total">
        <a-typography-text type="danger" strong class="text-xl">
          ${{ total.toFixed(2) }}
        </a-typography-text>
      </a-descriptions-item>
    </a-descriptions>
    <a-radio-group v-model:value="selectedPaymentMethod">
      <a-radio value="card">Credit/Debit Card</a-radio>
      <a-radio value="paypal">PayPal</a-radio>
      <a-radio value="cash">Cash</a-radio>
    </a-radio-group>
    <a-button type="primary" block @click="handlePayment">
      Confirm Payment
    </a-button>
  </a-modal>
</template>

<script setup>
definePageMeta({
  layout: 'pos'
})
import { ref, computed } from 'vue'
import { MenuOutlined, ShoppingCartOutlined } from '@ant-design/icons-vue'

const categories = ['All', 'Brew Equipment', 'Coffee', 'Espresso', 'Instant + RTD', 'Ceramics', 'Apparel']

const products = [
  { name: 'Fellow Prismo French Black', price: 30, image: 'https://placehold.co/50', category: 'Brew Equipment' },
  { name: 'Fellow Stagg Kettle Black', price: 165, image: 'https://placehold.co/50', category: 'Brew Equipment' },
  { name: 'Baratza Encore Grinder Black', price: 170, image: 'https://placehold.co/50', category: 'Brew Equipment' },
  { name: 'Jennings CJ4000 Digital Scale', price: 40, image: 'https://placehold.co/50', category: 'Brew Equipment' },
  { name: 'Colombia Single Origin Coffee', price: 18, image: 'https://placehold.co/50', category: 'Coffee' },
  { name: 'Espresso Blend', price: 20, image: 'https://placehold.co/50', category: 'Espresso' },
  { name: 'Cold Brew Concentrate', price: 15, image: 'https://placehold.co/50', category: 'Instant + RTD' },
  { name: 'Ceramic Pour-Over Dripper', price: 25, image: 'https://placehold.co/50', category: 'Ceramics' },
]

const searchQuery = ref('')
const category = ref('All')
const cart = ref([])
const showPaymentModal = ref(false)
const selectedPaymentMethod = ref('card')

const filteredProducts = computed(() => 
  products.filter(product => 
    (category.value === 'All' || product.category === category.value) &&
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const addToCart = (product) => {
  const existingItem = cart.value.find(item => item.name === product.name)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({ ...product, quantity: 1 })
  }
}

const removeFromCart = (product) => {
  const existingItem = cart.value.find(item => item.name === product.name)
  if (existingItem.quantity === 1) {
    cart.value = cart.value.filter(item => item.name !== product.name)
  } else {
    existingItem.quantity--
  }
}

const subtotal = computed(() => 
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const tax = computed(() => subtotal.value * 0.08) // Assuming 8% tax rate

const total = computed(() => subtotal.value + tax.value)

const onSearch = (value) => {
  searchQuery.value = value
}

const onCategoryChange = (value) => {
  category.value = value
}

const handlePayment = () => {
  // Implement payment logic based on selectedPaymentMethod
  console.log('Selected Payment Method:', selectedPaymentMethod.value)
  // Example:
  if (selectedPaymentMethod.value === 'card') {
    // Process credit/debit card payment
  } else if (selectedPaymentMethod.value === 'paypal') {
    // Process PayPal payment
  } else if (selectedPaymentMethod.value === 'cash') {
    // Handle cash payment
  }
  showPaymentModal.value = false
}
</script>

<style scoped>
.product-card {
  height: 100%;
}

/* Add any additional styles here if needed */
</style>