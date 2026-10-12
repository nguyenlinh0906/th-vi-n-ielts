/* ============================================================
   1) ĐÁP ÁN – điền vào đây (để "" nếu chưa có thì sẽ không chấm câu đó)
   - Nhiều đáp án chấp nhận được: "colour/color"
   - Câu 24–25: điền 2 đáp án, thứ tự nào cũng được
   ============================================================ */
const ANSWERS = {
  1:"",2:"",3:"",4:"",5:"",6:"",7:"",8:"",9:"",10:"",
  11:"",12:"",13:"",14:"",15:"",
  16:"",17:"",18:"",19:"",20:"",
  21:"",22:"",23:"",
  "24-25":["",""],
  26:"",27:"",28:"",29:"",30:"",
  31:"",32:"",33:"",34:"",35:"",36:"",37:"",38:"",39:"",40:""
};

/* ============================================================
   2) NỘI DUNG ĐỀ – dạng dữ liệu
   Trong html: {{n}} = ô điền từ, {{n:sel}} = ô chọn A–I / A–H (theo "letters" của khối)
   ============================================================ */
const MAP_SRC = "map.jpg";
const LIST_11_15 = {A:"button",B:"website",C:"helmet",D:"light",E:"locker",F:"password",G:"rack",H:"screen",I:"sound"};

const TEST = [
 { title:"SECTION 1", instr:"Questions 1–10 · Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
   blocks:[{type:"notes", html:`
    <h3>Beach Heads Travel – Customer Request Sheet</h3>
    <p><b>Example</b></p>
    <p><b>Name:</b> Duncan <b><i>White</i></b><br><b>Group details:</b> three adults and two children</p>
    <p><b>Date of arrival:</b> {{1}} (staying for 2 weeks)</p>
    <p><b>Week One</b></p>
    <p><b>Accommodation:</b></p>
    <ul><li>Book a {{2}} on the beach</li><li>Budget is around {{3}} a night</li></ul>

    <p><b>Activities:</b></p>
    <ul><li>The children want to go {{4}} – arrange for them to have a {{5}}</li>
    <li>Book a time for Susan and Jenny to play {{6}}</li>
    <li>Duncan wants to go {{7}} – send some information</li></ul>
    <p><b>Week Two</b></p>
    <p><b>Accommodation:</b> National Park – book a {{8}} ($100 per night)</p>
    <p><b>Activities:</b></p>
    <ul><li>Arrange a {{9}} for Jenny</li><li>Send Duncan a {{10}} for Marco's</li></ul>`}]},

 { title:"SECTION 2", instr:"Questions 11–15 · Complete the flow-chart. Choose FIVE answers, A–I, from the box.",
   blocks:[
    {type:"flow", steps:[
      "Subscribe to the service online to receive a card",
      "At the station, log on at the computer terminal",
      "Select a bike by using the {{11:sel}}",
      "Release the bike by using the {{12:sel}} – of your chosen bike",
      "Remove the bike from the {{13:sel}} (You have ten seconds.)",
      "Make sure you have a {{14:sel}} before setting off",
      "At the end of your journey, return the bike to a station and secure in place<br>(A {{15:sel}} – will tell you the bike is locked correctly)"],
     letters:"ABCDEFGHI", list:LIST_11_15, title:"How to use City Cycle"},
    {type:"map", instr:"Questions 16–20 · Label the plan below. Choose the correct letter, A–H.", letters:"ABCDEFGH",
     items:[[16,"Coffee cart"],[17,"Workshop"],[18,"Lockers"],[19,"Showers"],[20,"Towel"]]}]},

 { title:"SECTION 3", instr:"Questions 21–30",
   blocks:[
