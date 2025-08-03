# Supabaseサンプルデータセットアップガイド

このガイドでは、OrgChart ManagerアプリケーションでSupabaseにサンプルデータを設定する方法を説明します。

## 前提条件

1. **Supabaseプロジェクトの作成**
   - [Supabase](https://supabase.com)でアカウントを作成
   - 新しいプロジェクトを作成

2. **環境変数の設定**
   - `.env.local`ファイルをプロジェクトルートに作成
   - 以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. **必要なパッケージのインストール**
```bash
npm install
```

## セットアップ方法

### 方法1: SQLマイグレーションを使用（推奨）

1. **Supabase CLIのインストール**
```bash
npm install -g supabase
```

2. **Supabaseプロジェクトとの接続**
```bash
supabase login
supabase link --project-ref your_project_id
```

3. **マイグレーションの実行**
```bash
supabase db push
```

### 方法2: JavaScriptスクリプトを使用

環境変数が設定されていれば、以下のコマンドでサンプルデータを挿入できます：

```bash
npm run setup-sample-data
```

このスクリプトは以下を実行します：
- 既存のサンプルデータをクリア
- テナント、部門、従業員データを挿入
- 採用計画を作成
- 初期組織バージョンを作成

## サンプルデータの内容

### 📊 データ統計
- **テナント**: 1社（TechStartup Inc.）
- **部門**: 13部門（階層構造）
- **従業員**: 30名（CEO、VP、マネージャー、スタッフ）
- **採用計画**: 3件
- **組織バージョン**: 1件

### 🏢 組織構造

```
TechStartup Inc.
├── CEO (Michael Chen)
├── Engineering (CTO: Sarah Wilson)
│   ├── Frontend Team (Lead: Emma Davis)
│   ├── Backend Team (Lead: James Miller)
│   └── DevOps Team (Lead: Sophie Brown)
├── Sales (VP: David Rodriguez)
│   ├── Enterprise Sales
│   └── SMB Sales
├── Marketing (VP: Jennifer Kim)
│   ├── Digital Marketing
│   └── Content Team
├── HR (VP: Robert Thompson)
├── Finance (CFO: Lisa Anderson)
└── Operations
```

### 👥 主要従業員

- **CEO**: Michael Chen (michael.chen@company.com)
- **CTO**: Sarah Wilson (sarah.wilson@company.com)
- **VP of Sales**: David Rodriguez (david.rodriguez@company.com)
- **VP of Marketing**: Jennifer Kim (jennifer.kim@company.com)
- **VP of People**: Robert Thompson (robert.thompson@company.com)
- **CFO**: Lisa Anderson (lisa.anderson@company.com)

## 確認方法

1. **Supabaseダッシュボードで確認**
   - Supabaseプロジェクトのダッシュボードにアクセス
   - "Table Editor"でデータが正しく挿入されているか確認

2. **アプリケーションで確認**
```bash
npm run dev
```
   - ブラウザで`http://localhost:3000`にアクセス
   - 従業員一覧や組織図が表示されることを確認

## トラブルシューティング

### 環境変数が設定されていない場合
```
❌ NEXT_PUBLIC_SUPABASE_URL is not set
```
→ `.env.local`ファイルに正しい環境変数を設定してください

### 権限エラーが発生する場合
```
❌ Row Level Security policies
```
→ 現在のマイグレーションではRLSポリシーを"Allow all"に設定しています。
本番環境では適切なセキュリティポリシーに変更してください。

### データが表示されない場合
1. Supabaseダッシュボードでデータの存在を確認
2. ブラウザの開発者ツールでネットワークエラーを確認
3. 環境変数が正しく設定されているか確認

## セキュリティ注意事項

⚠️ **本番環境での注意点**:
1. サービスロールキーは本番環境では使用しない
2. RLSポリシーを適切に設定する
3. サンプルデータは本番環境では削除する
4. 認証とテナント分離を適切に実装する

## カスタマイズ

サンプルデータをカスタマイズしたい場合：

1. **SQLファイルを編集**: `supabase/migrations/004_sample_data.sql`
2. **JavaScriptスクリプトを編集**: `scripts/setup-sample-data.js`
3. **スクリプトを再実行**: `npm run setup-sample-data`

## 関連ドキュメント

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabaseの基本セットアップ
- [CLAUDE.md](./CLAUDE.md) - プロジェクト概要と開発ガイド
- [README.md](./README.md) - アプリケーションの使用方法