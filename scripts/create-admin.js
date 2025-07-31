const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function updateUserToAdmin(email) {
  try {
    console.log(`Looking for user with email: ${email}`)
    
    // First, check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return
    }
    
    const user = authUsers.users.find(u => u.email === email)
    
    if (!user) {
      console.log('User not found in auth.users')
      return
    }
    
    console.log('Found user:', user.id, user.email)
    
    // Update user metadata to include admin role
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'
        }
      }
    )
    
    if (updateError) {
      console.error('Error updating user:', updateError)
      return
    }
    
    console.log('Successfully updated user to admin role')
    console.log('User ID:', updatedUser.user.id)
    console.log('Email:', updatedUser.user.email)
    console.log('Role:', updatedUser.user.user_metadata.role)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

async function createAdminUser(email, password) {
  try {
    console.log(`Creating admin user: ${email}`)
    
    // Create user with admin role
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })
    
    if (createError) {
      console.error('Error creating user:', createError)
      return
    }
    
    console.log('Successfully created admin user')
    console.log('User ID:', newUser.user.id)
    console.log('Email:', newUser.user.email)
    console.log('Role:', newUser.user.user_metadata.role)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

async function listUsers() {
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    
    console.log('All users:')
    authUsers.users.forEach(user => {
      console.log(`- ${user.email} (${user.id}) - Role: ${user.user_metadata?.role || 'learner'}`)
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Command line interface
const command = process.argv[2]
const email = process.argv[3]
const password = process.argv[4]

switch (command) {
  case 'update-admin':
    if (!email) {
      console.log('Usage: node create-admin.js update-admin <email>')
      process.exit(1)
    }
    updateUserToAdmin(email)
    break
    
  case 'create-admin':
    if (!email || !password) {
      console.log('Usage: node create-admin.js create-admin <email> <password>')
      process.exit(1)
    }
    createAdminUser(email, password)
    break
    
  case 'list':
    listUsers()
    break
    
  default:
    console.log('Available commands:')
    console.log('  update-admin <email>     - Update existing user to admin role')
    console.log('  create-admin <email> <password> - Create new admin user')
    console.log('  list                     - List all users')
    process.exit(1)
}

