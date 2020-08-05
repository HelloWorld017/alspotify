# Alspotify
> 스포티파이에서 재생중인 노래의 알송 가사 또는 스포티파이 내장 가사 (알송 가사가 없을 시)를 화면에 표시해줍니다.  
> node.js의 Qt바인딩인 nodegui를 사용해 제작되었습니다.

![Screenshot](https://i.imgur.com/0JJMhaU.png)

## Warning
**현재 Alspotify는 베타 상태로, 추후에 설정과 종료 등을 쉽게 할 수 있는 프로그램을 따로 제작할 예정입니다.**

## Installation
설치방법은 다음과 같습니다.

1. [Spicetify 설치](https://github.com/khanhas/spicetify-cli)  
   * 다음 링크의 지시사항에 따라 Spicetify 를 설치해주세요.

2. [Alspotify 다운로드](https://github.com/HelloWorld017/alspotify/releases)  
   * Release 탭에서 최신버전의 Alspotify를 다운로드 후 압축을 해제해주세요.

3. Alspotify Companion 설치  
   * Spicetify 설치 위치의 Extensions 폴더에 Alspotify/extensions 폴더 안에 있는 `alspotify.js` 를 복사해 붙여넣어주세요.  
   * 이후 `spicetify config extensions alspotify.js` 명령어로 `alspotify.js`를 추가해주세요.  
   * `spicetify apply` 명령어로 적용하면 스포티파이가 꺼졌다 켜지면서 적용됩니다.

4. Alspotify 실행  
   * Alspotify 폴더에서 `qode.exe` 를 실행하면 다음 곡부터 화면 우측하단에 자막이 표시됩니다.

## Config
Alspotify 폴더의 `config.json` 을 편집하셔서 폰트나 색상, 표시되는 자막 수 등을 변경하실 수 있습니다.  

## Shutdown
POST `http://localhost:29192/shutdown` HTTP 요청을 함으로 종료할 수 있습니다.

## TODO
- [ ] 설정 프로그램 제작, 시스템 트레이 기능 지원
- [ ] 다중 실행 시의 충돌 방지
- [ ] 가사 찾기 알고리즘 개선, 알송 서버에서 가져온 여러 가사 중 가장 재생시간이 맞는 가사 찾도록

## Known Bugs
- [ ] 재생 초반에 프로그레스바에 곡면 모서리가 적용안됨
- [ ] 가사 송출 알고리즘 개선
  - [ ] 가끔씩 동시에 나와야할 자막이 쪼개져서 나오는 경우가 있음
  - [ ] 가끔씩 마지막 가사가 짤리는 경우가 있음
