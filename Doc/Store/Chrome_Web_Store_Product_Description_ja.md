AI コーディングのクォータを、作業が止まる前に確認。AI Usage Dashboard は、source が公開する制限、リセット時刻、支出、同期状態を Chrome 拡張機能にまとめます。

ツールバーの popup ですばやく確認し、詳細は side panel や full-page dashboard で確認できます。設定の先頭に Quick Setup があるため、使う source だけを接続できます。

Codex、Cursor、Claude Personal、Claude Code の組織向け分析、Gemini Code Assist、ユーザー設定の Sub2API 互換ゲートウェイなどのワークフローを対象に、各 source が正確な値、部分的な情報、使用ウィンドウ、policy-only、または利用不可のどれなのかを明示します。

cookie や生のブラウザー auth header の貼り付けは求めません。設定、任意の API 認証情報、ページの関連付け、キャッシュされた snapshot、import/export ファイル、Chrome Sync データは Chrome プロファイルに保存されます。

確認できること

• provider の状態と設定ブロッカー
• provider が公開している場合の残り使用ウィンドウとリセット時刻
• source 種別：API、ログイン済みページ、部分的なページ情報、documented policy、または利用不可
• snapshot の鮮度と同期状態
• 任意のクォータ/リセット通知。アプリ内警告とシステム通知のしきい値は別設定
• 期間別集計、集計データの安全な CSV 出力、匿名化された診断レポート
• 期間・単位・通貨が比較可能な保存済み Sub2API デプロイの比較
• 同じ端末で手動ペアリングする任意の Codex CLI Companion。条件付きの API 相当額推定は請求額や残高ではありません
• toolbar badge と toolbar icon の動作
• 独自のクォータ endpoint 向けのカスタム HTTP/HTTPS JSON source
• 設定した Sub2API 互換ゲートウェイが返す集計残高、支出、リクエスト、Token、モデル、傾向、制限
• 従来の進捗バンド、または編集可能な残量カラー gradient 表示
• 言語、テーマ、popup 外観、進捗スタイル、provider 順序、import/export 設定

日常での使いどころ

AI コーディングアシスタントは便利ですが、クォータページやアカウント状態は迷子になりがちです。さっきまで動いていたのに、次の瞬間にはクォータ枠、権限不足、期限切れのログイン状態、または provider のポリシー変更に引っかかることがあります。

AI Usage Dashboard は状態を見やすくまとめ、未知の値や古いキャッシュを新しい source の値と区別します。

Provider coverage は正直に表示します

provider によって公開される情報は異なります：

• live または near-live の使用ウィンドウを表示できるもの
• 部分的なページ情報だけを取得できるもの
• このリリースでは policy-only のもの
• ログイン済みページ、任意の host access、API 認証情報が必要なもの
• 初回利用時、host permission が blocker の場合は Provider card が focused な「アクセスを許可」action を表示するもの
• dashboard、API、クォータ表現、ポリシーが変更される可能性があるもの

source が利用不可または部分的な場合、拡張機能は数値を推測せず、その状態を表示します。

プライバシーと権限

AI Usage Dashboard は保守的な設計です：

• cookie の貼り付けは不要
• 生のブラウザー auth header の貼り付けは不要
• 任意の host permission は対応 provider の origin にのみ使用
• custom JSON source はユーザーが承認した HTTP または HTTPS endpoint だけを、ブラウザー credential なしで取得します
• Sub2API API key は設定したゲートウェイの正確な origin にだけ送信され、個別のリクエスト記録は取り込みません
• favicon permission は任意の provider-matched toolbar icon 機能にのみ使用
• ローカル画像から gradient を生成するとき、画像はブラウザー内で処理され、元の画像 bytes はアップロードも保存もされません
• packaged script のみを実行し、remote code は読み込みません
• 設定とキャッシュデータは、明示的に export しない限り Chrome プロファイルに保存されます
• Codex Companion は同じ端末で手動起動・ペアリングしたときだけ動作し、拡張機能がインストールや起動を行うことはありません

これは OpenAI、Cursor、Anthropic、Google、JetBrains、その他 provider の公式製品ではありません。

オープンソース

このプロジェクトは AGPL-3.0-only のオープンソースです：
https://github.com/David-Lzy/AI_Usage_Dashboard
