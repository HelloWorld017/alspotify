# Alspotify

> `스포티파이` 혹은 `유튜브 뮤직`등의 `뮤직 플레이어`에서 재생중인 노래의 알송 가사를 화면에 표시해줍니다.  
> 알송 가사가 존재하지 않는 경우, 스포티파이의 내장 가사를 표시합니다. (**스포티파이로 재생하는 경우만 해당**)  
> node.js의 Qt 바인딩인 nodegui를 사용해 제작되었습니다.

### Screenshot

Spotify                    |  Youtube Music
:-------------------------:|:-------------------------:
![Spotify Screenshot](https://i.imgur.com/0JJMhaU.png) | ![YouTube Music Screenshot](https://user-images.githubusercontent.com/16558115/213177792-f9169231-9727-4dde-8fa9-72fad393cd9d.png)


## Warning

**현재 Alspotify는 베타 상태로, 추후에 설정 기능을 구현할 예정입니다.**

## Installation

설치 방법은 다음과 같습니다.

### Spotify

1. [Spicetify 설치](https://github.com/khanhas/spicetify-cli)  
   * 다음 링크의 지시사항에 따라 `Spicetify`를 설치해주세요.

2. [Alspotify 다운로드](https://github.com/HelloWorld017/alspotify/releases)  
   * Release 탭에서 최신버전의 Alspotify를 다운로드 후 압축을 해제해주세요.

3. Alspotify Companion 설치  
   * Spicetify 설치 위치의 Extensions 폴더에 Alspotify/extensions 폴더 안에 있는 `alspotify.js` 를 복사해 붙여넣어주세요.  
   * 이후 `spicetify config extensions alspotify.js` 명령어로 `alspotify.js`를 추가해주세요.  
   * `spicetify apply` 명령어로 적용하면 스포티파이가 꺼졌다 켜지면서 적용됩니다.
   
### Youtube Music

1. [Youtube Music Desktop 설치](https://github.com/th-ch/youtube-music/releases)
   * 다음 링크의 지시사항에 따라 `Youtube Music Desktop`을 설치해주세요.
   
2. `Youtube Music Desktop`을 실행하고, 상단 메뉴의 `plugins`를 클릭한 뒤 `tuna-obs`를 활성화해주세요.

3. [Alspotify 다운로드](https://github.com/HelloWorld017/alspotify/releases)  
   * Release 탭에서 최신버전의 Alspotify를 다운로드 후 압축을 해제해주세요.
   
### 그 외 플레이어

- [tuna-obs](https://github.com/univrsal/tuna)를 참고하세요.

### (모든 뮤직 플레이어 해당) 마지막 단계

- `Alspotify` 실행  
   * `Alspotify` 폴더에서 `qode.exe` 를 실행하면 다음 곡부터 화면 우측하단에 자막이 표시됩니다.

## Config

Alspotify 폴더의 `config.json` 을 편집하여 폰트 및 색상, 표시되는 자막 수 등을 변경하실 수 있습니다.

`KoPubWorld 돋움체 Medium`으로 설정한 예제 |
:------------------------------------:|
![example image](https://user-images.githubusercontent.com/16558115/213178938-1b6249f5-1646-49b7-8564-56a28d08f780.png)


## Shutdown

두가지 방법을 사용할 수 있습니다.

- `http://localhost:1608/shutdown`에 HTTP `POST` 요청
- 트레이에 있는 `Alspotify` 아이콘 우클릭, `Exit` 클릭

## TODO
- [ ] 설정 프로그램 제작
- [x] 시스템 트레이 기능 지원
- [x] 다중 실행 시의 충돌 방지
- [ ] 가사 찾기 알고리즘 개선, 알송 서버에서 가져온 여러 가사 중 가장 재생시간이 맞는 가사 찾도록 가사 검색기 추가

## Known Bugs
- [ ] 재생 초반에 프로그레스바에 곡면 모서리가 적용안됨
- [ ] 가사 송출 알고리즘 개선
  - [ ] 가끔씩 동시에 나와야할 자막이 쪼개져서 나오는 경우가 있음
  - [ ] 가끔씩 마지막 가사가 짤리는 경우가 있음
