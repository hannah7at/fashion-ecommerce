<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')

const auth = useAuthStore()
const router = useRouter()

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert('كلمات المرور غير متطابقة!')
    return
  }

  const userData = {
    fullName: fullName.value,
    email: email.value,
    phone: phone.value,
    password: password.value
  }

  auth.register(userData)

  if (auth.isLoggedIn) {
    router.push('/')
  }
}
</script>

<template>
  <div class="register-page d-flex align-items-center justify-content-center min-vh-100 py-5">
    <div class="container">
      <div class="row justify-content-center align-items-center">
        
        <!-- الصورة -->
        <div class="col-md-6 d-none d-md-block text-center p-3">
          <img src="/register.jpeg" alt="Register Illustration" class="img-fluid custom-image" />
        </div>

        <!-- الكارت -->
        <div class="col-md-6 col-lg-5">
          <div class="card shadow p-4 p-md-5 border-0 custom-card">
            <h3 class="text-center mb-4 custom-title">Create Account</h3>

            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <input v-model="fullName" type="text" class="form-control custom-input" placeholder="Full Name" required />
              </div>

              <div class="mb-3">
                <input v-model="email" type="email" class="form-control custom-input" placeholder="Email Address" required />
              </div>

              <div class="mb-3">
                <input v-model="phone" type="tel" class="form-control custom-input" placeholder="Phone Number" required />
              </div>

              <div class="mb-3">
                <input v-model="password" type="password" class="form-control custom-input" placeholder="Password" required />
              </div>

              <div class="mb-4">
                <input v-model="confirmPassword" type="password" class="form-control custom-input" placeholder="Confirm Password" required />
              </div>

              <button type="submit" class="btn custom-btn w-100">
                Create Account
              </button>
            </form>

            <p class="text-center mt-4 mb-0 custom-text-secondary">
              Already have an account?
              <router-link to="/login" class="custom-link">Login</router-link>
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  background-color: #FDF9F7;
}

.custom-card {
  border-radius: 16px;
  background-color: #FFFFFF;
}

.custom-title {
  color: #1B3B36;
  font-family: serif;
}

.custom-input {
  border-color: #EBD6CF;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.custom-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(235, 214, 207, 0.4);
  border-color: #B79C8C;
}

.custom-btn {
  background-color: #1B3B36;
  color: #FFFFFF;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  border: none;
}

.custom-btn:hover {
  background-color: #132A27;
  color: #FFFFFF;
}

.custom-text-secondary {
  color: #2F2F2F;
}

.custom-link {
  color: #1B3B36;
  font-weight: 600;
  text-decoration: underline;
}

.custom-image {
  max-width: 100%;
  max-height: 550px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}
</style>