export default {
  name: [
    val => !!val || 'Full Name is required',
    val => val && val.length <= 30 || 'Name must be less than 30 characters',
    val => val && val.length >= 3 || 'Name must be more than 2 characters',
  ],
  email: [
    val => !!val || 'Email is required',
    val => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) || 'Email must be in email format',
  ],
  password: [
    val => !!val || 'Password is required',
  ],
}
