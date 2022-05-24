[![CI](https://github.com/aoisupersix/gpx-elevation-profile/actions/workflows/ci.yml/badge.svg)](https://github.com/aoisupersix/gpx-elevation-profile/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/aoisupersix/gpx-elevation-profile/badge.svg?branch=master)](https://coveralls.io/github/aoisupersix/gpx-elevation-profile?branch=master)

# gpx-elevation-profile

![](./assets/demo.gif)

GPX ファイルから区間ごとの平均勾配によって色分けされた斜度グラフを生成する Web アプリケーションです。

処理は全てクライアントサイド（ブラウザ上）で行われるため、GPX ファイルがサーバにアップロードされることはありません。

開発中のアプリのため予告なく破壊的な変更等を行います。使用は自己責任でお願いします。

## 必要条件

IE を除く主要なブラウザ

## 試す

https://aoisupersix.github.io/gpx-elevation-profile/

## 機能

- GPX ファイルから斜度グラフの生成
- 斜度グラフの PNG 出力
- 平均勾配を算出する距離の変更
- グラフの背景色の変更
- 平均勾配ごとに塗る色の設定

## 開発

```sh
npm install
npm run start # Start development server
npm run build # Build for production
```

## 今後対応したいもの

- i18n
- レスポンシブ対応

## ライセンス

This project is licensed under the MIT License - see the [license](./license) file for details
