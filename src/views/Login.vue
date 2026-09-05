<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const email = ref('')
const password = ref('')

const emailError = ref('')
const passwordError = ref('')
const errorMessage = ref('')

const isLoading = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

/* ================================
   VALIDATION
================================ */

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const isEmailValid = computed(() => {
  return emailPattern.test(
    email.value.trim()
  )
})

function validateEmail() {
  emailError.value = ''

  const value = email.value.trim()

  if (!value) {
    emailError.value =
      'Please enter your email address.'
    return false
  }

  if (!emailPattern.test(value)) {
    emailError.value =
      'Please enter a valid email address.'
    return false
  }

  return true
}

function validatePassword() {
  passwordError.value = ''

  if (!password.value) {
    passwordError.value =
      'Please enter your password.'
    return false
  }

  return true
}

function validateForm() {
  errorMessage.value = ''

  const validEmail = validateEmail()
  const validPassword = validatePassword()

  return validEmail && validPassword
}

/* ================================
   LOGIN
================================ */

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = authStore.login(
      email.value.trim(),
      password.value
    )

    if (!result.success) {
      errorMessage.value = result.message
      return
    }

    const redirectPath =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/'

    await router.push(redirectPath)
  } catch (error) {
    console.error(error)

    errorMessage.value =
      'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}

/* ================================
   LIVE VALIDATION
================================ */

function clearEmailError() {
  if (emailError.value) {
    emailError.value = ''
  }

  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

function clearPasswordError() {
  if (passwordError.value) {
    passwordError.value = ''
  }

  if (errorMessage.value) {
    errorMessage.value = ''
  }
}
</script>

<template>
  <div
    class="login-page d-flex align-items-center justify-content-center min-vh-100"
  >
    <div class="container">

      <div
        class="row justify-content-center align-items-center g-4"
      >

        <!-- ================================
             IMAGE
        ================================= -->
        <div
          class="col-md-6 d-none d-md-block text-center p-3"
        >
          <img
            src="/login.jpeg"
            alt="Login Illustration"
            class="img-fluid custom-image"
          />
        </div>


        <!-- ================================
             LOGIN CARD
        ================================= -->
        <div class="col-md-6 col-lg-5">

          <div
            class="card shadow p-4 p-md-5 border-0 custom-card"
          >

            <!-- HEADER -->
            <div class="login-header">

              <span class="eyebrow">
                WELCOME BACK
              </span>

              <h3 class="custom-title">
                Welcome Back
              </h3>

              <p class="custom-subtitle">
                Login to your Lumora account
              </p>

            </div>


            <!-- FORM -->
            <form
              @submit.prevent="handleLogin"
              novalidate
            >

              <!-- EMAIL -->
              <div class="form-field">

                <label
                  for="email"
                  class="custom-label"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-control custom-input"
                  :class="{
                    'input-error': emailError
                  }"
                  placeholder="Enter your email"
                  autocomplete="email"
                  @input="clearEmailError"
                  @blur="validateEmail"
                />

                <div
                  v-if="emailError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ emailError }}
                </div>

              </div>


              <!-- PASSWORD -->
              <div class="form-field">

                <label
                  for="password"
                  class="custom-label"
                >
                  Password
                </label>

                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="form-control custom-input"
                  :class="{
                    'input-error': passwordError
                  }"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  @input="clearPasswordError"
                  @blur="validatePassword"
                />

                <div
                  v-if="passwordError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ passwordError }}
                </div>

              </div>


              <!-- STORE ERROR -->
              <div
                v-if="errorMessage"
                class="error-message"
              >
                <div class="error-icon">
                  !
                </div>

                <div>
                  <strong>
                    Login failed
                  </strong>

                  <p>
                    {{ errorMessage }}
                  </p>
                </div>
              </div>


              <!-- SUBMIT -->
              <button
                type="submit"
                class="btn custom-btn w-100"
                :disabled="isLoading"
              >

                <span
                  v-if="isLoading"
                  class="loading-spinner"
                ></span>

                <span>
                  {{
                    isLoading
                      ? 'Logging in...'
                      : 'Login'
                  }}
                </span>

              </button>

            </form>


            <!-- REGISTER -->
            <p
              class="text-center mt-4 mb-0 custom-text-secondary"
            >
              Don't have an account?

              <router-link
                to="/register"
                class="custom-link"
              >
                Create Account
              </router-link>
            </p>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 70px);
  padding: 40px 0;
  background-color: var(--color-beige);
}

/* ================================
   CARD
================================ */

.custom-card {
  border-radius: var(--radius-card, 16px);
  background-color: var(--color-white);
  border: 1px solid rgba(183, 156, 140, 0.18) !important;
}

.login-header {
  margin-bottom: 30px;
  text-align: center;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--color-sand);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
}

.custom-title {
  margin-bottom: 8px;
  color: var(--color-primary);
  font-family: var(--font-family-base, 'Poppins', sans-serif);
  font-size: 28px;
  font-weight: 600;
}

.custom-subtitle {
  margin-bottom: 0;
  color: #777777;
  font-size: 14px;
  line-height: 1.6;
}

/* ================================
   FORM
================================ */

.form-field {
  margin-bottom: 20px;
}

.custom-label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-gray);
  font-size: 13px;
  font-weight: 600;
}

.custom-input {
  min-height: 48px;
  padding: 12px 15px;

  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-default, 8px);

  color: var(--color-gray);
  background-color: var(--color-white);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.custom-input::placeholder {
  color: #a0a0a0;
}

.custom-input:hover {
  border-color: var(--color-sand);
}

.custom-input:focus {
  border-color: var(--color-sand);
  background-color: var(--color-white);

  box-shadow:
    0 0 0 4px
    rgba(235, 214, 207, 0.35);

  outline: none;
}

.custom-input.input-error {
  border-color: #c85b68;
  background-color: #fffafa;
}

.custom-input.input-error:focus {
  border-color: #c85b68;

  box-shadow:
    0 0 0 4px
    rgba(200, 91, 104, 0.1);
}

/* ================================
   FIELD ERROR
================================ */

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-top: 7px;

  color: #b33a4a;
  font-size: 12px;
  line-height: 1.4;
}

.field-error span {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  flex-shrink: 0;

  border-radius: 50%;

  background-color: #b33a4a;
  color: white;

  font-size: 10px;
  font-weight: 700;
}

/* ================================
   GENERAL ERROR
================================ */

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-bottom: 18px;
  padding: 12px 14px;

  border: 1px solid #f0c8cd;
  border-radius: 10px;

  background-color: #fff5f6;
  color: #b33a4a;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  flex-shrink: 0;

  border-radius: 50%;

  background-color: #b33a4a;
  color: white;

  font-size: 12px;
  font-weight: 700;
}

.error-message strong {
  display: block;
  margin-bottom: 2px;

  font-size: 12px;
  font-weight: 600;
}

.error-message p {
  margin: 0;

  color: #8f4a54;
  font-size: 12px;
  line-height: 1.5;
}

/* ================================
   BUTTON
================================ */

.custom-btn {
  min-height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  padding: 12px;

  border: 1px solid var(--color-primary);
  border-radius: var(--radius-default, 8px);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-size: 14px;
  font-weight: 600;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.custom-btn:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  color: var(--color-white);

  transform: translateY(-1px);

  box-shadow:
    0 7px 18px
    rgba(27, 59, 54, 0.14);
}

.custom-btn:active:not(:disabled) {
  transform: translateY(0);
}

.custom-btn:disabled {
  background-color: #8b9c98;
  border-color: #8b9c98;
  cursor: not-allowed;
  opacity: 0.8;
}

/* ================================
   LOADING
================================ */

.loading-spinner {
  width: 16px;
  height: 16px;

  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: var(--color-white);

  border-radius: 50%;

  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================================
   FOOTER
================================ */

.custom-text-secondary {
  color: var(--color-gray);
  font-size: 13px;
}

.custom-link {
  margin-left: 4px;

  color: var(--color-primary);

  font-weight: 600;
  text-decoration: none;

  transition: color 0.2s ease;
}

.custom-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

/* ================================
   IMAGE
================================ */

.custom-image {
  width: 100%;
  max-width: 520px;
  max-height: 520px;

  object-fit: cover;

  border-radius: var(--radius-card, 16px);

  box-shadow:
    0 10px 30px
    rgba(0, 0, 0, 0.05);
}

/* ================================
   RESPONSIVE
================================ */

@media (max-width: 767px) {
  .login-page {
    padding: 24px 0;
  }

  .custom-card {
    padding: 32px 24px !important;
  }

  .custom-title {
    font-size: 25px;
  }
}
</style>