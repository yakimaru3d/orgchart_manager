# Authentication Troubleshooting Guide

## "Invalid login credentials" エラーの解決方法

### 1. ユーザーが存在しない場合

最も一般的な原因は、Supabaseにログインしようとしているユーザーが存在しないことです。

#### 解決方法 A: デモユーザー作成スクリプトを実行

1. Service Role Keyを`.env.local`に追加:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. スクリプトを実行:
```bash
node scripts/create-demo-users.js
```

#### 解決方法 B: Supabaseの管理画面で手動作成

1. Supabaseの管理画面にアクセス
2. Authentication → Users に移動
3. "Add user" をクリック
4. 以下のユーザーを作成:
   - Email: `admin@company.com`, Password: `password`
   - Email: `hr@company.com`, Password: `password`
   - Email: `manager@company.com`, Password: `password`
   - Email: `employee@company.com`, Password: `password`

#### 解決方法 C: サインアップ機能を使用

1. アプリケーションでサインアップページを作成
2. 新しいユーザーを登録
3. Supabaseで Email confirmation を無効化（開発時のみ）

### 2. 環境変数の確認

`.env.local`ファイルで以下を確認:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 確認手順:
1. Supabase プロジェクト設定 → API に移動
2. Project URL と anon public key が正しいことを確認
3. `.env.local`を更新後、開発サーバーを再起動

### 3. Supabase設定の確認

#### Email認証設定:
1. Supabase管理画面 → Authentication → Settings
2. "Enable email confirmations" を無効化（開発時のみ）
3. "Enable sign-ups" が有効になっていることを確認

#### RLS (Row Level Security) ポリシー:
1. SQL Editor で以下を実行して確認:
```sql
SELECT * FROM auth.users WHERE email = 'admin@company.com';
```

### 4. デバッグ手順

#### ブラウザーコンソールをチェック:
1. 開発者ツールを開く (F12)
2. Console タブでエラーメッセージを確認
3. Network タブでAPI呼び出しを確認

#### ログ出力:
認証時のコンソールログを確認:
```
🔐 Attempting to sign in with: admin@company.com
❌ Sign in error: Invalid login credentials
```

### 5. よくある問題と解決策

#### 問題: "Email not confirmed"
**解決策**: 
```sql
-- Supabaseで直接email_confirmed_atを設定
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'admin@company.com';
```

#### 問題: "User not found"
**解決策**: ユーザーを作成するか、正しいメールアドレスを使用

#### 問題: "Too many requests"
**解決策**: レート制限に達した場合は数分待機

#### 問題: "Invalid JWT"
**解決策**: 
1. ブラウザーのローカルストレージをクリア
2. anon keyが正しいことを確認

### 6. 開発環境での推奨設定

#### Supabase Authentication Settings:
```
Enable sign-ups: ✅ Enabled
Enable email confirmations: ❌ Disabled (開発時のみ)
Enable phone confirmations: ❌ Disabled
Secure password change: ✅ Enabled
```

#### 本番環境での設定:
```
Enable sign-ups: ✅ Enabled
Enable email confirmations: ✅ Enabled
Enable phone confirmations: ❌ Disabled (必要に応じて)
Secure password change: ✅ Enabled
```

### 7. テスト用コマンド

#### デモユーザーでのログインテスト:
```bash
# cURLでの認証テスト
curl -X POST 'https://your-project-id.supabase.co/auth/v1/token?grant_type=password' \
-H "apikey: your-anon-key" \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@company.com",
  "password": "password"
}'
```

#### Supabase接続テスト:
```javascript
// ブラウザーコンソールで実行
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### 8. 緊急時の対処法

すべてが失敗した場合:

1. **新しいSupabaseプロジェクトを作成**
2. **マイグレーションを再実行**
3. **環境変数を更新**
4. **デモユーザーを再作成**

### 9. サポートリソース

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## まとめ

認証エラーの90%は以下で解決できます:

1. ✅ ユーザーがSupabaseに存在することを確認
2. ✅ 正しい認証情報を使用
3. ✅ 環境変数が正しく設定されている
4. ✅ Email confirmationが適切に設定されている

それでも解決しない場合は、このドキュメントの詳細な手順に従ってください。