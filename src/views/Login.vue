<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')

const auth = useAuthStore()
const router = useRouter()

const handleLogin = () => {
  auth.login(email.value, password.value)

  if (auth.isLoggedIn) {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100">
    <div class="container">
      <div class="row justify-content-center align-items-center">
        
        <!-- قسم الصورة -->
        <div class="col-md-6 d-none d-md-block text-center p-3">
          <img src="/login.jpeg" alt="Login Illustration" class="img-fluid custom-image" />
        </div>

        <!-- قسم كارت تسجيل الدخول -->
        <div class="col-md-6 col-lg-5">
          <div class="card shadow p-4 p-md-5 border-0 custom-card">
            <h3 class="text-center mb-4 custom-title">Login to Lumora</h3>

            <input v-model="email" class="form-control mb-3 custom-input" placeholder="Email" />
            <input v-model="password" type="password" class="form-control mb-4 custom-input" placeholder="Password" />

            <button class="btn w-100 custom-btn-primary" @click="handleLogin">
              Login
            </button>

            <p class="text-center mt-4 mb-0 custom-text-secondary">
              Don't have an account?
              <router-link to="/register" class="custom-link">Register</router-link>
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
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

.custom-btn-primary {
  background-color: #1B3B36;
  color: #FFFFFF;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  transition: all 0.3s ease;
}

.custom-btn-primary:hover {
  background-color: #142d29;
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
  max-height: 520px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}
</style>