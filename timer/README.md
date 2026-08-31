# OJapp Free Timer

URLのクエリに設定状態を保存し、その状態をホーム画面から直接起動できる、OJapp Freeの1P1Aサンプルタイマーです。

```text
/timer/?time=5&mode=down&seconds=on
```

## Query parameters

| Parameter | Values | Description |
| --- | --- | --- |
| `time` | `1`–`60` | タイマー時間（分） |
| `mode` | `down`, `up` | カウント方向 |
| `seconds` | `on`, `off` | 秒で表示 |

設定を変更するとURLのクエリも更新されます。

そのURLをホーム画面へ追加すると、選択した時間・カウント方向・秒表示の設定を保持したタイマーとして起動します。

## User Defined App

このタイマーは、ユーザーがURLのクエリを通してアプリの起動状態を定義する、PWA UDA（User Defined App）の実装サンプルです。

開発者が完成した1つのタイマーを固定するのではなく、ユーザー自身が設定した状態をホーム画面のアプリ入口として保存できます。

実機検証では、iPhoneとAndroidのどちらでも、設定状態を保持したままホーム画面から起動できることを確認しています。

OSによって、同じページから作成できる入口の扱いに違いがあります。

| OS | 設定状態を保持した起動 | 同一ページの複数状態を追加 |
| --- | --- | --- |
| iPhone | 対応 | 対応 |
| Android | 対応 | 非対応 |

Androidでは、同じタイマーページから複数の設定状態を別々のアプリとして同時に追加することはできません。ただし、ユーザーが選んだ1つの設定状態を保存し、その状態のまま起動することはできます。

## OJapp query option

OJapp Freeの1P1Aスクリプトは、次のメタタグがある場合に、現在のクエリをWeb App Manifestへ反映します。

```html
<meta name="ojapp:query" content="true">
```

1P1Aでは、Manifestへ次のように反映されます。

```text
id        = ページURL + クエリ
start_url = ページURL + クエリ
scope     = ページURL（クエリなし）
```

このメタタグがないページでは、従来どおりクエリを除いたページURLを使用します。

`scope`のクエリはWeb App Manifestの処理時に削除されるため、OJappでも常にクエリを含めません。

## Updating the Manifest

JavaScriptでクエリを書き換えたあとは、OJappのManifestも更新します。

```js
history.replaceState(null, "", url);

window.ojappRefreshManifest?.();
```

これにより、ホーム画面へ追加した時点の最新設定が`id`と`start_url`へ反映されます。

## Files

```text
ojapp.js

timer/
├── index.html
├── style.css
├── timer.js
└── icon.png
```

`ojapp.js`には、`ojapp:query`オプションに対応したOJapp Freeの1P1Aスクリプトを使用します。

GitHub Pagesでは、リポジトリのルートを公開対象に設定してください。
