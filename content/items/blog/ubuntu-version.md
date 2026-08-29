---
title: Ubuntu OS バージョン偽装方法
date: "2024-01-01"
emoji: "📄"
---
`/etc/os-release` の `VERSION_ID` を書き換える。

```
VERSION_ID="20.04"   # これを
VERSION_ID="18.04"   # こうする
```
