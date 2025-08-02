# OrgChart Manager

従業員一覧管理・組織図管理SaaS - Next.js フロントエンド実装

## 概要

OrgChart Managerは、企業の従業員情報と組織構造を一元管理し、動的で視覚的な組織図を提供するSaaSアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIライブラリ**: Shadcn/ui
- **組織図可視化**: React Flow (@xyflow/react)
- **フォーム管理**: React Hook Form + Zod
- **認証**: NextAuth.js
- **アイコン**: Lucide React

## 実装済み機能

### 🔐 認証システム
- NextAuth.jsを使用したログイン/ログアウト機能
- ロールベースアクセス制御（システム管理者、HR管理者、部門マネージャー、一般ユーザー）
- デモアカウント提供

### 👥 従業員管理
- 従業員一覧表示（検索・フィルタリング機能付き）
- 従業員詳細情報表示
- 従業員情報の追加・編集機能
- プロフィール画像、スキル、経歴管理
- レスポンシブデザイン対応

### 🌳 組織図機能
- React Flowを使用したインタラクティブな組織図
- ドラッグ&ドロップ対応
- 部署別・レベル別フィルタリング
- ズーム・パン機能
- ミニマップ表示

### 📊 レポート・分析
- 組織統計ダッシュボード
- レポート生成機能（PDF、Excel、CSV対応予定）
- 成長トレンド分析
- 部署別統計

### ⚙️ 設定管理
- プロフィール設定
- 組織設定
- セキュリティ設定
- 通知設定
- 外観設定
- データ管理

## デモアカウント

```
システム管理者: admin@company.com / password
HR管理者: hr@company.com / password
部門マネージャー: manager@company.com / password
一般ユーザー: employee@company.com / password
```

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 開発サーバーの起動:
```bash
npm run dev
```

3. アプリケーションにアクセス:
```
http://localhost:3000
```

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router ページ
│   ├── auth/              # 認証関連ページ
│   ├── dashboard/         # ダッシュボード
│   ├── employees/         # 従業員管理
│   ├── org-chart/         # 組織図
│   ├── reports/           # レポート
│   └── settings/          # 設定
├── components/            # Reactコンポーネント
│   ├── ui/               # Shadcn/ui コンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   ├── employees/        # 従業員関連コンポーネント
│   └── org-chart/        # 組織図コンポーネント
├── lib/                  # ユーティリティとヘルパー
├── types/                # TypeScript型定義
└── hooks/                # カスタムHooks
```

## 主要なコンポーネント

### レイアウト
- `DashboardLayout`: メインのダッシュボードレイアウト
- `Sidebar`: ナビゲーションサイドバー

### 従業員管理
- `EmployeeList`: 従業員一覧表示
- `EmployeeDetail`: 従業員詳細情報
- `EmployeeForm`: 従業員追加・編集フォーム

### 組織図
- `OrgChart`: React Flowベースの組織図
- `OrgChartNode`: 組織図ノードコンポーネント

## 次のステップ

1. **バックエンド実装**: データベース設計とAPI実装
2. **リアルタイム更新**: WebSocketを使用したリアルタイム同期
3. **ファイルアップロード**: Cloudinaryまたは類似サービスとの統合
4. **テスト**: ユニットテストと統合テストの実装
5. **デプロイ**: Vercelへのデプロイ設定

## ライセンス

MIT License
# orgchart_manager
# orgchart_manager
