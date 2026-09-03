<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')

const profileImage = ref('')
const imagePreview = ref('')

const fullNameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const errorMessage = ref('')

const isLoading = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

/* ================================
   VALIDATION
================================ */

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateFullName() {
  fullNameError.value = ''

  const value = fullName.value.trim()

  if (!value) {
    fullNameError.value = 'Please enter your full name.'
    return false
  }

  if (value.length < 2) {
    fullNameError.value = 'Name must be at least 2 characters.'
    return false
  }

  return true
}

function validateEmail() {
  emailError.value = ''

  const value = email.value.trim()

  if (!value) {
    emailError.value = 'Please enter your email address.'
    return false
  }

  if (!emailPattern.test(value)) {
    emailError.value = 'Please enter a valid email address.'
    return false
  }

  return true
}

function validatePhone() {
  phoneError.value = ''

  const value = phone.value.trim()

  if (!value) {
    phoneError.value = 'Please enter your phone number.'
    return false
  }

  if (!/^[0-9+\-\s()]{7,20}$/.test(value)) {
    phoneError.value = 'Please enter a valid phone number.'
    return false
  }

  return true
}

function validatePassword() {
  passwordError.value = ''

  if (!password.value) {
    passwordError.value = 'Please enter your password.'
    return false
  }

  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
    return false
  }

  return true
}

function validateConfirmPassword() {
  confirmPasswordError.value = ''

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password.'
    return false
  }

  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match.'
    return false
  }

  return true
}

function validateForm() {
  errorMessage.value = ''

  const validFullName = validateFullName()
  const validEmail = validateEmail()
  const validPhone = validatePhone()
  const validPassword = validatePassword()
  const validConfirmPassword = validateConfirmPassword()

  return (
    validFullName &&
    validEmail &&
    validPhone &&
    validPassword &&
    validConfirmPassword
  )
}

/* ================================
   PROFILE IMAGE
================================ */

function handleImageChange(event) {
  const file = event.target.files?.[0]

  if (!file) {
    profileImage.value = ''
    imagePreview.value = ''
    return
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select a valid image file.'
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Image size must be less than 5MB.'
    event.target.value = ''
    return
  }

  errorMessage.value = ''

  const reader = new FileReader()

  reader.onload = () => {
    profileImage.value = reader.result
    imagePreview.value = reader.result
  }

  reader.readAsDataURL(file)
}

function removeImage() {
  profileImage.value = ''
  imagePreview.value = ''

  const input = document.getElementById('profileImage')

  if (input) {
    input.value = ''
  }
}

/* ================================
   REGISTER
================================ */

async function handleRegister() {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const userData = {
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      password: password.value,
      profileImage: profileImage.value || ''
    }

    authStore.register(userData)

    if (!authStore.isLoggedIn) {
      errorMessage.value =
        'Registration failed. Please check your information and try again.'
      return
    }

    const redirectPath =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/'

    await router.push(redirectPath)
  } catch (error) {
    console.error('Registration error:', error)

    errorMessage.value =
      'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}

/* ================================
   LIVE VALIDATION
================================ */

function clearFullNameError() {
  if (fullNameError.value) {
    fullNameError.value = ''
  }

  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

function clearEmailError() {
  if (emailError.value) {
    emailError.value = ''
  }

  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

function clearPhoneError() {
  if (phoneError.value) {
    phoneError.value = ''
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

function clearConfirmPasswordError() {
  if (confirmPasswordError.value) {
    confirmPasswordError.value = ''
  }

  if (errorMessage.value) {
    errorMessage.value = ''
  }
}
</script>

<template>
  <div
    class="register-page d-flex align-items-center justify-content-center min-vh-100"
  >
    <div class="container">
      <div
        class="row justify-content-center align-items-center g-4"
      >
        <!-- IMAGE -->
        <div
          class="col-md-6 d-none d-md-block text-center p-3"
        >
          <img
            src="/login.jpeg"
            alt="Create Account"
            class="img-fluid custom-image"
          />
        </div>

        <!-- REGISTER CARD -->
        <div class="col-md-6 col-lg-5">
          <div
            class="card shadow p-4 p-md-5 border-0 custom-card"
          >
            <!-- HEADER -->
            <div class="register-header">
              <span class="eyebrow">
                JOIN LUMORA
              </span>

              <h3 class="custom-title">
                Create Account
              </h3>

              <p class="custom-subtitle">
                Create your Lumora account and start shopping
              </p>
            </div>

            <!-- FORM -->
            <form
              @submit.prevent="handleRegister"
              novalidate
            >
              <!-- FULL NAME -->
              <div class="form-field">
                <label
                  for="fullName"
                  class="custom-label"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  v-model="fullName"
                  type="text"
                  class="form-control custom-input"
                  :class="{
                    'input-error': fullNameError
                  }"
                  placeholder="Enter your full name"
                  autocomplete="name"
                  @input="clearFullNameError"
                  @blur="validateFullName"
                />

                <div
                  v-if="fullNameError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ fullNameError }}
                </div>
              </div>

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

              <!-- PHONE -->
              <div class="form-field">
                <label
                  for="phone"
                  class="custom-label"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  v-model="phone"
                  type="tel"
                  class="form-control custom-input"
                  :class="{
                    'input-error': phoneError
                  }"
                  placeholder="Enter your phone number"
                  autocomplete="tel"
                  @input="clearPhoneError"
                  @blur="validatePhone"
                />

                <div
                  v-if="phoneError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ phoneError }}
                </div>
              </div>

              <!-- PROFILE IMAGE - OPTIONAL -->
              <div class="form-field">
                <label
                  for="profileImage"
                  class="custom-label"
                >
                  Profile Picture
                  <span class="optional-text">(Optional)</span>
                </label>

                <div class="profile-image-section">
                  <div
                    v-if="imagePreview"
                    class="image-preview-wrapper"
                  >
                    <img
                      :src="imagePreview"
                      alt="Profile Preview"
                      class="image-preview"
                    />

                    <button
                      type="button"
                      class="remove-image-btn"
                      @click="removeImage"
                    >
                      ×
                    </button>
                  </div>

                  <div
                    v-else
                    class="image-placeholder"
                  >
                    <span class="camera-icon">📷</span>
                    <span>No profile picture</span>
                  </div>

                  <label
                    for="profileImage"
                    class="choose-image-btn"
                  >
                    {{ imagePreview ? 'Change Photo' : 'Choose Photo' }}
                  </label>

                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="handleImageChange"
                  />

                  <small class="image-hint">
                    JPG, PNG or WEBP · Max 5MB
                  </small>
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
                  placeholder="Create a password"
                  autocomplete="new-password"
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

              <!-- CONFIRM PASSWORD -->
              <div class="form-field">
                <label
                  for="confirmPassword"
                  class="custom-label"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  class="form-control custom-input"
                  :class="{
                    'input-error': confirmPasswordError
                  }"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  @input="clearConfirmPasswordError"
                  @blur="validateConfirmPassword"
                />

                <div
                  v-if="confirmPasswordError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ confirmPasswordError }}
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
                    Registration failed
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
                      ? 'Creating account...'
                      : 'Create Account'
                  }}
                </span>
              </button>
            </form>

            <!-- LOGIN -->
            <p
              class="text-center mt-4 mb-0 custom-text-secondary"
            >
              Already have an account?

              <router-link
                to="/login"
                class="custom-link"
              >
                Login
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
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

.register-header {
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
  margin-bottom: 18px;
}

.custom-label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-gray);
  font-size: 13px;
  font-weight: 600;
}

.optional-text {
  margin-left: 5px;
  color: #999999;
  font-size: 11px;
  font-weight: 400;
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
    0 0 0 4px rgba(235, 214, 207, 0.35);
  outline: none;
}

.custom-input.input-error {
  border-color: #c85b68;
  background-color: #fffafa;
}

.custom-input.input-error:focus {
  border-color: #c85b68;
  box-shadow:
    0 0 0 4px rgba(200, 91, 104, 0.1);
}

/* ================================
   PROFILE IMAGE
================================ */

.profile-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px dashed var(--color-pink-light);
  border-radius: 12px;
  background-color: var(--color-beige);
}

.image-preview-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  margin-bottom: 12px;
}

.image-preview {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--color-white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: #b33a4a;
  color: white;
  font-size: 18px;
  line-height: 22px;
  cursor: pointer;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  margin-bottom: 12px;
  border-radius: 50%;
  background-color: var(--color-pink-light);
  color: var(--color-gray);
  font-size: 10px;
  text-align: center;
}

.camera-icon {
  margin-bottom: 3px;
  font-size: 25px;
}

.choose-image-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 18px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-default, 8px);
  background-color: var(--color-white);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.choose-image-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.image-hint {
  margin-top: 8px;
  color: #999999;
  font-size: 10px;
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
    0 7px 18px rgba(27, 59, 54, 0.14);
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
    0 10px 30px rgba(0, 0, 0, 0.05);
}

/* ================================
   RESPONSIVE
================================ */

@media (max-width: 767px) {
  .register-page {
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
