const next = document.getElementById("next");
next.style.display = "none";

const prev = document.getElementById("prev");

const link = window.location.href;
const startIndex = link.lastIndexOf("/") + 1;
const endIndex = link.lastIndexOf(".html");
const curNum = parseInt(link.substring(startIndex, endIndex)) - 1;

const startIndex2 = link.indexOf("quizes/") + "quizes/".length;
const endIndex2 = link.indexOf("/", startIndex2);
const curName = link.substring(startIndex2, endIndex2);

const curElement = data.find(e => e.name == curName);

const curNumTooBig = (curElement.max_page == curNum+1);
const curNumTooSmall = (curNum) <= 0;

const quiz = document.getElementById("quiz");
const quizType = parseInt(quiz.getAttribute("t"));

var answers = curElement.good[curNum];

function nextLink(){
	window.location.href = `../../quizes/${curName}/${curNum+2}.html`;
}
function prevLink(){
	window.location.href = `../../quizes/${curName}/${curNum}.html`;
}

function shuffle(base){
	for (var i = base.children.length; i >= 0; i--) { //https://stackoverflow.com/a/11972692
		base.appendChild(base.children[Math.random() * i | 0]);
	}
}

function test(e = document.createElement("select")){
	e = e.target;
	if(e.value != ""){
		const parent = e.parentElement;
		const divs = e.parentElement.parentElement.children;
		/*for(var i = 0; i < divs.length; i++){
			const div = divs[i];
			if(div != parent && div.firstElementChild.value == e.value){
				//div.firstElementChild.value = document.oldVal;
				break;
			}
		}*/
	}
	//document.oldVal = e.value;
}

function check(e){
	var good = false;

	switch(quizType){
		case 0:  // rádió / jelölő
			const button_checks = quiz.querySelectorAll("input:checked");
			if(Array.isArray(answers)){ // jelölő négyzet
				if(button_checks.length == answers.length){
					good = true;
					button_checks.forEach(e => {
						if(answers.indexOf(parseInt(e.id)) == -1) {
							good = false;
							return;
						}
					});
				}
			}
			else good = button_checks[0].id == answers; // rádió gombok
			break;
		case 1: //párba rakós
			break;
		case 2: //sorba rakós
			const num_checks = quiz.querySelectorAll("select");
			good = true;
			num_checks.forEach(e => {
				if(parseInt(e.value) != parseInt(e.nextElementSibling.getAttribute("for"))){
					good = false;
					return;
				}
			});
			break;
		case 3:
			break;
		case 4:
			break;
	}
	
	if(good){
		alert("jó válasz");
		e.style.display = "none";
		next.style.display = "";
	}
	else alert("rossz válasz");
}

if(curNumTooBig || curNumTooSmall){
	if(curNumTooBig && !curNumTooSmall){
		next.disabled = true;
		prev.addEventListener("click", prevLink);
	}
	else if(curNumTooSmall && !curNumTooBig){
		prev.disabled = true;
		next.addEventListener("click", nextLink);
	}
	else next.disabled = prev.disabled = true;
}
else{
	next.addEventListener("click", nextLink);
	prev.addEventListener("click", prevLink);
}

const jump = document.getElementById("jump");

for(var i = 1; i <= curElement.max_page; i++){
	const a = jump.appendChild(document.createElement("div")).appendChild(document.createElement("a"));
	a.href = `../../quizes/${curName}/${i}.html`;
	a.innerText = i;
	a.parentElement.classList.add("p-1");
}

switch(quizType){
	case 0:
		shuffle(quiz);
		break;
	case 1:
		break;
	case 2:
		const temp = document.getElementById("temp");
		
		for(var i = 0; i < quiz.children.length; i++){
			const newTemp = temp.content.children[0].cloneNode(true);
			/*newTemp.addEventListener("change", test);
			newTemp.oldVal = "";*/
			newTemp.id = i;
			quiz.children[i].prepend(newTemp);
		}
		shuffle(quiz);
		break;
}