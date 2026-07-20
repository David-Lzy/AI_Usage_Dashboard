AI Usage Dashboard は、AI コーディングのクォータ、設定ブロック、同期状態をまとめて見られる小さなコックピットです。

Chrome ツールバーの popup でまずはさっと確認。詳しく見たいときは side panel や full-page dashboard を開けます。タブ探しを減らして、コードを書く時間を少し増やします。(^_^)

Codex、Cursor、Claude Personal、Claude Code の組織向け分析、Gemini Code Assist などのワークフローを対象に、各 source が正確な値、部分的な情報、使用ウィンドウ、policy-only、または利用不可のどれなのかを明示します。

cookie や生のブラウザー auth header の貼り付けは求めません。設定、任意の API 認証情報、ページの関連付け、キャッシュされた snapshot、import/export ファイル、Chrome Sync データは Chrome プロファイルに保存されます。

確認できること

• provider の状態と設定ブロッカー
• provider が公開している場合の残り使用ウィンドウとリセット時刻
• source 種別：API、ログイン済みページ、部分的なページ情報、documented policy、または利用不可
• snapshot の鮮度と同期状態
• toolbar badge と toolbar icon の動作
• 独自のクォータ endpoint 向けのカスタム HTTP/HTTPS JSON source
• 従来の進捗バンド、または編集可能な残量カラー gradient 表示
• 言語、テーマ、popup 外観、進捗スタイル、provider 順序、import/export 設定

日常での使いどころ

AI コーディングアシスタントは便利ですが、クォータページやアカウント状態は迷子になりがちです。さっきまで動いていたのに、次の瞬間にはクォータ枠、権限不足、期限切れのログイン状態、または provider のポリシー変更に引っかかることがあります。

AI Usage Dashboard は、その状態をひとつの落ち着いた場所にまとめます。まずは軽く確認して、本当に必要なときだけ詳細へ。小さなダッシュボードであって、もうひとつ管理するものを増やすためのものではありません。✨

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
• favicon permission は任意の provider-matched toolbar icon 機能にのみ使用
• ローカル画像から gradient を生成するとき、画像はブラウザー内で処理され、元の画像 bytes はアップロードも保存もされません
• packaged script のみを実行し、remote code は読み込みません
• 設定とキャッシュデータは、明示的に export しない限り Chrome プロファイルに保存されます

これは OpenAI、Cursor、Anthropic、Google、JetBrains、その他 provider の公式製品ではありません。

オープンソース

このプロジェクトは AGPL-3.0-only のオープンソースです：
https://github.com/David-Lzy/AI_Usage_Dashboard
