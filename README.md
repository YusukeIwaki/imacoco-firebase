# imacoco

<img src="https://user-images.githubusercontent.com/11763113/37872124-f2a6d84c-303b-11e8-9ce8-319e818eee96.png" width=480 />

現在地を誰かと共有したいときに、自分の居場所をトラッキングできる一時的なURLを発行します。

* アプリを明示的に終了することで、そのURLはもう使えなくなるので安全です。
* 発行したURLに誰かがアクセスしない限り位置情報の測位が行われないので、待機電力による電池の消耗を気にする必要はありません。

## オープンソースなのでご自由に改造してお使い下さい。

* Firebase: https://github.com/YusukeIwaki/imacoco-firebase
  * Google Map APIキー、Firebaseのホスト名などを設定する必要があります
* Androidアプリ: https://github.com/YusukeIwaki/imacoco-android
  * app/google-services.json を設置する必要があります。
