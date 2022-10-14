### 1. 프로젝트 소개

주제 : 실내 지도 데이터 생성 로봇

목적 : Light weight한 LiDAR를 활용한 실내 지도 데이터 생성 로봇 개발

### 2. 팀 소개

최호진, tiger981228@pusan.ac.kr, 3D 모델링 프로그램 개발 및 데이터 전처리

조창현, mvmarr@naver.com, 데이터 수집 장치 구현 및 길찾기 알고리즘 구현

박지호, jihodayo@gmail.com, Web서버 제작, DB 연동 및 관리

### 3. 구성도

시스템은 아래의 그림과 같이 이루어져 있다.

![시스템 다이어그램 drawio](https://user-images.githubusercontent.com/105587238/195822498-bfb85389-6059-48e3-95df-945ea169074e.png)

데이터 수집장치는 오로지 데이터 수집과 이동만 실행하고 WiFi를 통한 서버와의 통신을 통해 다음 동작을 실행한다.

서버에서는 알고리즘과 같은 cost가 높은 작업을 처리하고 다음 명령어를 장치에 전달하며 결과물을 보기위한 UI를 제공한다.

 ![장치그림](https://user-images.githubusercontent.com/105587238/195822415-1439f331-e2c3-4ef4-b13d-f4f34b291d25.jpg)

데이터 수집장치는 위와 같이 구성되어 있으며 스텝모터를 통해 장치는 움직인다.

### 4. 소개 및 시연 영상

youtube link

### 5. 사용법

본프로젝트는 웹에서 서비스를 하기 때문에 node.js가 설치된 서버가 필요

- Node.js 18.6.0
- Python 3.9.2

1. 서버에 코드 업로드

2. npm install

3. http://서버ip:8000 접속

4. 아두이노 라이브러리 설치

- TFMPlus
- Stepper
- ArduinoJson
- https://github.com/bportaluri/WiFiEsp.git 접속후 다운, "아두이노설치경로\libraries" 에 붙여넣기

5. 아두이노 업로드

6. 장치의 버튼 실행시 장치 동작 실행
