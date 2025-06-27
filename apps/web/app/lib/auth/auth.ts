// import { createClient } from '@/util/supabase/client'

// export async function signUpWithProfile(email: string, password: string, profileData: { name: string }) {
//   const supabase = createClient()
//   // サインアップ
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//   })

//   if (error) {
//     return { error }
//   }

//   const user = data.user
//   if (!user) {
//     return { error: 'User not created' }
//   }

//   // プロフィール作成
//   const { error: profileError } = await supabase
//     .from('profiles')
//     .insert({
//       user_id: user.id,
//       name: profileData.name,
//       // 他のカラムも必要なら追加
//     })

//   if (profileError) {
//     return { error: profileError }
//   }

//   return { user }
// }