# PowerPoint右側タスクペイン風 カラーパレットUIモック

PowerPointの右側タスクペインを想定した、ブラウザ動作のUIモックです。  
本リポジトリは見た目と挙動の確認用途であり、Office.js / VSTO 実装は含みません。

## 想定用途
- ベンダー向けのUI/UX共有
- 色適用フロー（文字/塗り/枠線）の挙動確認
- パレット編集・永続化・JSON連携の仕様確認

## ローカル起動
1. 依存インストール
```bash
npm install
```
2. 開発サーバー起動
```bash
npm run dev
```
3. 起動ログに表示されるURLをブラウザで開く

## GitHubで公開してURLだけで開く手順（GitHub Pages）
このプロジェクトには `.github/workflows/deploy-pages.yml` を同梱しています。  
`main` または `master` に push すると、自動で GitHub Pages にデプロイされます。

1. GitHubで新規リポジトリを作成（Public推奨）
2. このフォルダ内容を push
```bash
git init
git add .
git commit -m "init: color palette mock"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```
3. GitHub リポジトリの `Settings > Pages` を開く
4. `Build and deployment` の Source が `GitHub Actions` になっていることを確認
5. `Actions` タブで `Deploy To GitHub Pages` が成功したら公開URLにアクセス

公開URL例:
- `https://<ユーザー名>.github.io/<リポジトリ名>/`

## 画面構成
- 上部: リボン風バー
  - `カラーパレット` ボタンで右タスクペイン開閉
- 中央: スライドキャンバス
  - テキストボックス、長方形、円、矢印を配置
  - クリックで選択状態（枠線/ハンドル）表示
- 右側: タスクペイン
  - グループ見出し + 色一覧
  - 各色行に `A` (文字), `■` (塗り), `□` (枠線) の即時適用
  - 上部に適用対象モード（文字/塗り/枠線）

## 使い方
1. スライド上の要素をクリックして選択
2. タスクペインで色を適用
   - 色スウォッチ: 現在モードで適用
   - `A/■/□`: モードを無視して直接適用
3. 未選択で適用した場合は控えめなトーストを表示

## パレット編集
タスクペイン上部の `✎ 編集` で編集モードON/OFF。

編集モードで可能な操作:
- グループ名変更
- グループ追加/削除
- グループ並び替え（↑/↓）
- 色追加/削除
- 色並び替え（↑/↓）
- 色編集モーダル（カラーピッカー + HEX入力）
  - HEXは `#RRGGBB` 形式バリデーション
- `保存` で localStorage へ確定保存
- `エクスポート表示` + `コピー` で JSON 出力
- JSON貼り付けから `インポート反映`（不正JSON/不正形式はエラー）

## 永続化
- localStorageキー: `color-palette.taskpane.palette.v1`
- 保存済みパレットは再読み込み後も維持

## 実装上のポイント
- Vite + React + TypeScript
- UIライブラリ未使用（素のCSS）
- 色適用処理は `src/services/colorApplier.ts` の `applyColor(...)` に集約
  - 現在はモックとしてReact状態を更新しCSS反映
  - 将来、同関数境界を Office.js / VSTO 呼び出しに差し替え可能

## 主要ファイル
- `src/components/TaskPane.tsx`
- `src/components/SlideCanvas.tsx`
- `src/components/PaletteEditorModal.tsx`
- `src/services/colorApplier.ts`
- `src/storage/paletteStorage.ts`
- `src/types/palette.ts`
