#include <SoftwareSerial.h>
#include <Stepper.h>
#include <TFMPlus.h>  // Include TFMini Plus Library v1.5.0
TFMPlus tfmP;         // Create a TFMini Plus object
#include <ArduinoJson.h>
#include "WiFiEsp.h"
#include <Wire.h>

#define DEVIATION_X -100
#define DEVIATION_Y 150
#define Addr 0x1E               // 7-bit address of HMC5883 compass

#define BLUE_PIN 22
#define GREEN_PIN 24
#define RED_PIN 26

#define sm1_pin1 2
#define sm1_pin2 3
#define sm1_pin3 4
#define sm1_pin4 5

#define sm2_pin1 6
#define sm2_pin2 7
#define sm2_pin3 8
#define sm2_pin4 9

#define btn_pin 10

#define aroundInterval 4096  // 바퀴가 두 바퀴 도는 스텝
#define turnInterval 4700 // 차체가 한바퀴 도는 스텝 
#define LIDARDATASIZE 20      // 4700 / 70 = 470개의 데이터 수집 (1회전 당)

char ssid[] = "DTNLAB";            // your network SSID (name)
char pass[] = "pnudtn6519!";        // your network password
int status = WL_IDLE_STATUS;     // the Wifi radio's status
//char server[] = "13.125.205.44";  // server IP address
//int server_port = 3000;           // server port number

char server[] = "112.153.143.250";  // nas IP address
int server_port = 8000;           // nas port number
//http://112.153.143.250:8000/


// Initialize the Ethernet client object
WiFiEspClient client;

Stepper stepper1(aroundInterval / 2, sm1_pin4, sm1_pin2, sm1_pin3, sm1_pin1);
Stepper stepper2(aroundInterval / 2, sm2_pin4, sm2_pin2, sm2_pin3, sm2_pin1);

int16_t tfDist = 0;    // Distance to object in centimeters
int start_count;
int cur_x = 0; int cur_y = 0;
int nt_x = 0; int nt_y = 0;
int finish = 0;
int cur_rot = 0;

void setup() {
  Serial.begin(9600);
  Serial1.begin(9600); // initialize serial for ESP module
  Serial2.begin(115200);  // Initialize TFMPLus device serial port.
  delay(20);               // Give port time to initalize
  tfmP.begin(&Serial2);   // Initialize device library object and...
  // pass device serial port to the object.
  Wire.begin();

  // Set operating mode to continuous
  Wire.beginTransmission(Addr); 
  Wire.write(byte(0x02));
  Wire.write(byte(0x00));
  Wire.endTransmission();

  pinMode(BLUE_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(RED_PIN, OUTPUT);
  pinMode(btn_pin, INPUT);

  LedBlue();
  delay(50);
  LedStop();
  delay(50);
  LedBlue();
  delay(50);
  LedStop();

  // initialize ESP module
  WiFi.init(&Serial1);

  // check for the presence of the shield
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue
    while (true);
  }
  
  // attempt to connect to WiFi network
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network
    status = WiFi.begin(ssid, pass);
  }
  
  Serial.println("You're connected to the network");
  printWifiStatus();

  // Send some example commands to the TFMini-Plus
  // - - Perform a system reset - - - - - - - - - - -
  Serial.print( "Soft reset: ");
  if( tfmP.sendCommand( SOFT_RESET, 0))
  {
    Serial.print( "passed.\r\n");
  }
  else tfmP.printReply();

  delay(500);  // added to allow the System Rest enough time to complete

  // - - Display the firmware version - - - - - - - - -
  Serial.print( "Firmware version: ");
  if( tfmP.sendCommand( GET_FIRMWARE_VERSION, 0))
  {
    Serial.print(tfmP.version[ 0]); // print three single numbers
    Serial.print(tfmP.version[ 1]); // each separated by a dot
    Serial.print(tfmP.version[ 2]);
    Serial.println();
  }
  else tfmP.printReply();
  // - - Set the data frame-rate to 20Hz - - - - - - - -
  Serial.print( "Data-Frame rate: ");
  if( tfmP.sendCommand( SET_FRAME_RATE, FRAME_20))
  {
    Serial.print(FRAME_20);
    Serial.println();
  }
  else tfmP.printReply();

  start_count = 0;

  // 버튼 클릭 시 서버변수 초기화
  while(true) {
    if(digitalRead(btn_pin)){
      SendDataWeb("{\"LidarData\": [-1]}");
      Serial.println("Inti server data and Start service");
      LedGreen();
      delay(2000);
      LedStop();
      break;
    }
  }
  // 이동
  int Count = 0;
  unsigned long step_dist = 20 * int(aroundInterval / 44);
  Serial.print("step nt_dist = ");
  Serial.println(step_dist);
  while(true){
    // 거리(cm) * 두바퀴 당 스텝수(step/2rot) / 두바퀴 당 거리(cm/2rot) = 스탭수(step)
    if(Count >= step_dist) break; 
    Count++;
    Go();
  }
  delay(1000);
//  cur_rot = compass();
//  cur_rot = compass();
}

void loop() {
  if(finish == 1) {
     Serial.println("Finish!!!");
     while(true){}
  }
  String jsonstr = ""; // json string 선언  
  while(true){
    LidarDetectAround(jsonstr); // 반시계방향으로 360도 돌면서 거리 측정 및 좌표로 환산
    delay(1000);
    int nt_rot = compass();
    if(abs(nt_rot - cur_rot) <= 3) break;
    delay(1000);
//    compassCenter();
    jsonstr = "";
  }
  Serial.print("Make Json String :");
  Serial.println(jsonstr);
  SendDataWeb(jsonstr); // 측정된 좌표 웹에 전송
  getDataWeb(); // 다음 위치 받음
  while(true){
    if(finish != -1) break;
//    compassCenter();
    goNextPoint();
    delay(1000);
//    compassCenter();
    SendDataWeb("{\"LidarData\": [-2]}");
    getDataWeb(); // 다음 위치 받음
  }
//  compassCenter();
  goNextPoint();
  delay(500);
//  compassCenter();
  delay(2000);
}

void getDataWeb(){
  LedGreen();
  Serial.println("Starting connection to server...");
  while(true){
    // if you get a connection, report back via serial
    if (client.connect(server, server_port)) {
      Serial.println("Connected to server");
      // Make a HTTP request
      client.print(F("GET /default/control HTTP/1.1\r\n"));;
      client.print(F("Host: 112.153.143.250:8000\r\n"));
      client.print(F("Connection: close\r\n"));
      client.println();
      delay(500);
      break;
    }
    else {
      // if you couldn't make a connection
      Serial.println("Connection failed");
      LedRed();
      delay(500);
      getDataWeb();
      return;
    }
  }
  // if there are incoming bytes available
  // from the server, read them and print them
  String res_str = "";
  while(client.connected()){
    // There is a client connected. Is there anything to read?
    while(client.available())
    {
       res_str = client.readString();
    }
    Serial.println();
    Serial.println("Waiting for more data...");
    delay(10); // Have a bit of patience...
  }
  client.stop(); // 클라이언트 접속 종료
  // close the connection:
  Serial.println("Client disconnected");

  Serial.println("Response string : ");
  Serial.println(res_str);  // 응답 받은 데이터
  // 데이터 중 finish, x, y만 뽑아냄
  int start_str = res_str.indexOf(F("finish = "));
  int middle1_str = res_str.indexOf(F("x = "));
  int middle2_str = res_str.indexOf(F("y = "));
  int end_str = res_str.indexOf(F("</h1>"));
  String sub_str1 = res_str.substring(start_str + 9, middle1_str - 1);
  String sub_str2 = res_str.substring(middle1_str + 4, middle2_str - 1);
  String sub_str3 = res_str.substring(middle2_str + 4, end_str - 2);
  Serial.println("sub1 : |" + sub_str1 + "|");
  Serial.println("sub2 : |" + sub_str2 + "|");
  Serial.println("sub3 : |" + sub_str3 + "|");
  finish = sub_str1.toInt();
  nt_x = sub_str2.toInt();
  nt_y = sub_str3.toInt();
  Serial.print("Finish : ");
  Serial.print(finish);
  Serial.print(" Next Location : ");
  Serial.print(nt_x);
  Serial.print(" , ");
  Serial.println(nt_y);
}

void SendDataWeb(const String& jsonstr){
  LedGreen();
  Serial.println("Starting connection to server...");
  // if you get a connection, report back via serial
  if (client.connect(server, server_port)) {
    Serial.println("Connected to server");
    
    // Make a HTTP request
    client.print(F("POST /default/send HTTP/1.1\r\n"));
    client.print(F("Host: 12.153.143.250:8000\r\n" ));
    client.print(F("Content-Type: application/json\r\n"));
    client.print(F("Content-Length: "));
    client.println(jsonstr.length());
    client.println();
    client.println(jsonstr);
  }
  else {
    // if you couldn't make a connection
    LedRed();
    Serial.println("Connection failed");
    delay(500);
    SendDataWeb(jsonstr);
    return;
  }
  client.flush();
  client.stop(); // 클라이언트 접속 종료
  // close the connection:
  Serial.println("Client disconnected");
}

int getDataLidar(){
  tfmP.getData( tfDist); // Get data from the device.
  Serial.print( "Dist : ");   // display distance,
  Serial.print(tfDist);
  Serial.println( "cm");
  return tfDist;
}

void LidarDetectAround(String& jsonstr){
  LedBlue();
  DynamicJsonDocument doc(4096);
  JsonObject root = doc.to<JsonObject>();
  JsonArray LidarData = root.createNestedArray("LidarData");
  
  int Count = 0, dataCount = 0;
  int lidarInterval = LIDARDATASIZE;
  while(true){
    if(Count >= turnInterval) break;
    if(Count % lidarInterval == 0){
      int currentDist = getDataLidar();
      LidarData[dataCount] = currentDist;
      dataCount++;
    }
    Count++;
    LeftRound();
  }
  Serial.print("Length : ");
  Serial.println(dataCount);
  serializeJson(doc, jsonstr);
}

void goNextPoint(){
  LedPupple();
  if(nt_x == cur_x && nt_y == cur_y) return;
  // 다음 측정 위치로 이동을 위한 방위각 설정
  nt_x -= cur_x;
  nt_y -= cur_y;
  
  float degree = degrees(atan2(nt_y , nt_x));
  if(degree < 0) degree += 360;
  Serial.print("degree = ");
  Serial.println(degree);
  int nt_rot = int(degree * turnInterval / 360); 
  // 이동 방위각 회전
  unsigned long Count = 0;
  while(true){
    if(Count >= nt_rot) break;
    Count++;
    LeftRound();
  }
  
  int nt_dist = sqrt(pow(nt_x, 2) + pow(nt_y, 2));
  Serial.print("next_dist = ");
  Serial.println(nt_dist);
  delay(500);

  // 이동
  Count = 0;
  unsigned long step_dist = nt_dist * int(aroundInterval / 44);
  Serial.print("step nt_dist = ");
  Serial.println(step_dist);
  while(true){
    // 거리(cm) * 두바퀴 당 스텝수(step/2rot) / 두바퀴 당 거리(cm/2rot) = 스탭수(step)
    if(Count >= step_dist) break; 
    Count++;
    Go();
  }

  nt_x += cur_x;
  nt_y += cur_y;
  cur_x = nt_x;
  cur_y = nt_y;

  // 이동 후 방위각 90도로 다시 돌아옴
  Count = 0;
  while(true){
    if(Count >= nt_rot) break;
    Count++;
    RightRound();
  }
}

void compassCompact(){
  int detect_rot = compass();
  if(cur_rot > detect_rot + 1){
    RightRound();
    compassCompact();
    return;
  }
  else if(cur_rot < detect_rot - 1){
    LeftRound();
    compassCompact();
    return;
  }
  return;
}

void compassCenter()
{
  int detect_rot = compass();
  if(cur_rot > detect_rot + 3){
    compassCompact();
  }
  else if(cur_rot < detect_rot - 3){
    compassCompact();
  }
  return;
}


int compass()
{
  float sum_angle = 0;
  for(int i=0; i<5; i++){
    int x, y, z;
    // Initiate communications with compass
    Wire.beginTransmission(Addr);
    Wire.write(byte(0x03));       // Send request to X MSB register
    Wire.endTransmission();
  
    Wire.requestFrom(Addr, 6);    // Request 6 bytes; 2 bytes per axis
    if(Wire.available() <=6) {    // If 6 bytes available
      x = Wire.read() << 8 | Wire.read();
      z = Wire.read() << 8 | Wire.read();
      y = Wire.read() << 8 | Wire.read();
    }
  
    x += DEVIATION_X;
    y += DEVIATION_Y;
  
    // 방위각 계산 및 출력
    float angle = -atan2(x, y) * 180 / 3.14159;
    sum_angle += angle;
  }
  sum_angle = sum_angle / 5;
  // Print raw values
  Serial.print("A = ");
  Serial.println(round(sum_angle));
  return round(sum_angle);
}

void printWifiStatus()
{
  // print the SSID of the network you're attached to
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  
  // print your WiFi shield's IP address
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength
  long rssi = WiFi.RSSI();
  Serial.print("Signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

void Go(){
  stepper1.setSpeed(10);
  stepper2.setSpeed(10);
  stepper1.step(-1);
  stepper2.step(1);
}

void RightRound(){
  stepper1.setSpeed(10);
  stepper2.setSpeed(10);
  stepper1.step(-1);
  stepper2.step(-1);
}

void LeftRound(){
  stepper1.setSpeed(10);
  stepper2.setSpeed(10);
  stepper1.step(1);
  stepper2.step(1);
}

void LedBlue(){
  digitalWrite(BLUE_PIN, HIGH);
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(RED_PIN, LOW);
}
void LedGreen(){
  digitalWrite(BLUE_PIN, LOW);
  digitalWrite(GREEN_PIN, HIGH);
  digitalWrite(RED_PIN, LOW);
}
void LedRed(){
  digitalWrite(BLUE_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(RED_PIN, HIGH);
}
void LedPupple(){
  digitalWrite(BLUE_PIN, HIGH);
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(RED_PIN, HIGH);
}
void LedStop(){
  digitalWrite(BLUE_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(RED_PIN, LOW);
}
