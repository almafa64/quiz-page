const type = document.getElementById("type");
const hold = document.getElementById("hold");
const saveBut = document.getElementById("save");
const iframe = document.getElementById("webHold");

const topicList = document.getElementById("topic");
const topicListName = document.getElementById("topicName");
const quizList = document.getElementById("question");
const quizListName = document.getElementById("questionName");

const dataScript = document.createElement("script");
const filesScript = document.createElement("script");

var quizType = NaN;   // will be set
var topicName = "test"; // will be set
var quizNum = 0;  // will be set

var files = [];

function loadThings(loadFiles = true, loadTopics = false){
	if(loadFiles){
		dataScript.src = `/quizes/${topicName}/files.js`;
		document.body.appendChild(dataScript);
		dataScript.onload = () => {
			console.log(data);
			data.good.forEach((e,i) => {
				const tmp = quizList.appendChild(document.createElement("option"));
				tmp.value = i;
				tmp.innerText = `${i+1}.`;
			});
		};
	}

	if(loadTopics){
		filesScript.src = "/scr/files.js";
		document.body.appendChild(filesScript);
		filesScript.onload = () => {
			/*
			test
			test/sub1
			test/sub1/subsub1
			test/sub1/subsub2
			test/sub1/subsub2/subsubsub1
			test/sub2
			*/
			console.log(files);
		};
	}
}

function addRow(leftText = "", rightText = "", selected = false){
	if(isNaN(quizType)) return false;

	const p = hold.appendChild(document.createElement("p"));
	const leftArea = document.createElement("textarea");
	leftArea.value = leftText;
	p.append(`${hold.childElementCount}, `, leftArea);

	switch(quizType){
		case 0:
			const checkbox = p.appendChild(document.createElement("input"));
			checkbox.type = "checkbox";
			checkbox.name = "a";
			checkbox.checked = selected;
			break;
		case 1:
			const radio = p.appendChild(document.createElement("input"));
			radio.type = "radio";
			radio.name = "a";
			radio.checked = selected;
			break;
		case 2: // párba
			const rightArea = document.createElement("textarea");
			rightArea.value = rightText;
			p.append(" - ", rightArea);
			break;
		case 4: // térkép
			alert("no");
			break;
	}

	if(addRow.button == undefined){
		const button = p.appendChild(document.createElement("button"));
		button.innerText = "mégegy sor hozzáadása";
		button.type = "button";
		button.addEventListener("click", e => {
			addRow();
		});
		addRow.button = button;
	}
	else p.appendChild(addRow.button);

	return true;
}

function changeType(){
	quizType = parseInt(type.value);
	hold.innerHTML = "";
	saveBut.disabled = !addRow();
}

function changeTopic(){
	if(topicList.value != ""){
		const file = files[parseInt(topicList.value)]; //json parse + looping -> sub1sub2sub3 = [0,1,2], sub2sub3sub1 = [1,2,0]
		topicListName.value = topicName = file.name;
		loadThings();
	}
	else{
		topicListName.value = topicName = "";
	}
}

function changeQuiz(){
	hold.innerHTML = "";

	if(quizList.value != ""){
		quizNum = parseInt(quizList.value);

		iframe.src = `/quizes/${topicName}/${quizNum+1}.html`;
		iframe.onload = () => {
			quizListName.value = iframe.contentDocument.getElementById("question").innerText;
			const iframeQuiz = iframe.contentDocument.getElementById("quiz");
			quizType = parseInt(iframeQuiz.getAttribute("t"));
			type.value = quizType;

			const good = data.good[quizNum];
			switch(quizType){
				case 0:
					iframeQuiz.querySelectorAll("label").forEach((e, i) => {
						addRow(e.innerText, "", good.includes(i));
					});
					break;
				case 1:
					iframeQuiz.querySelectorAll("label").forEach((e, i) => {
						addRow(e.innerText, "", good == i);
					});
					break;
				case 2:
					const leftSide = iframeQuiz.querySelectorAll(".row .col-5:first-child p");
					iframe.contentDocument.getElementById("hold").querySelectorAll("p").forEach((e, i) => {
						addRow(leftSide[i].innerText, e.innerText);
					});
					break;
				case 3:
					iframeQuiz.querySelectorAll(".drag p").forEach(e => {
						addRow(e.innerText);
					});
					break;
			}
		};
	}
	else{
		quizListName.value = "";
		type.value = "";
	}
}

function save(){
	function templateWrite(template, func){
		iframe.src = template;
		iframe.onload = () => {
			iframe.contentDocument.getElementById("question").innerText = document.getElementById("questionName").value; //"" -> remove selected, selected != this -> change selected
			iframe.contentDocument.getElementsByTagName("title")[0].innerText = `${quizNum+1}. Kérdés`;

			const quiz = iframe.contentDocument.getElementById("quiz");
			func(quiz, hold.querySelectorAll("textarea"));

			const html = "<!DOCTYPE html>" + iframe.contentDocument.documentElement.outerHTML.replace(/[^\S ]/g, "");
			const allInput = hold.querySelectorAll("input");
			switch(quizType){
				case 0:
					var goods = [];
					hold.querySelectorAll("input:checked").forEach(e => {
						const place = Array.prototype.indexOf.call(allInput, e);
						if(place != -1) goods.push(place);
					});
					data.good[quizNum] = goods;
					break;
				case 1:
					const select = hold.querySelector("input:checked");
					if(select == null) {
						alert("Nincs egy megfejtés sem kiválasztva");
						return;
					}
					data.good[quizNum] = Array.prototype.indexOf.call(allInput, select);
					break;
				case 2:
					var goods = [];
					quiz.querySelectorAll("#hold .drag").forEach(e => {
						goods.push(e.innerText);
					});
					data.good[quizNum] = goods;
					break;
				case 3:
					data.good[quizNum] = [];
					break;
				case 4:
					break;
			}
			const json = `const data={"max_page":${(data.max_page < quizNum) ? quizNum : data.max_page},"good":${JSON.stringify(data.good)}}`;

			fetch(`/save?n=${topicName}&q=${quizNum}`, {
				method: 'POST',
				body: JSON.stringify([html, json])
			})
			//.then(() => window.location.reload())
			.catch(err => console.error(err));
		};
	}

	function basicType(type, iframeQuiz, textAreas){
		textAreas.forEach((e, i) => {
			const div = iframeQuiz.appendChild(document.createElement("div"));
			const input = div.appendChild(document.createElement("input"));
			const label = div.appendChild(document.createElement("label"));

			input.type = type;
			input.name = "q";
			input.id = `${i}`;
			label.setAttribute("for", `${i}`)
			label.innerText = e.value;
		});
	}

	switch(quizType){
		case 0:
			templateWrite("/templates/checkbox.html", (iframeQuiz, textAreas) => basicType("checkbox", iframeQuiz, textAreas));
			break;
		case 1:
			templateWrite("/templates/radio.html", (iframeQuiz, textAreas) => basicType("radio", iframeQuiz, textAreas));
			break;
		case 2:
			templateWrite("/templates/pair.html", (iframeQuiz, textAreas) => {
				const iframHold = iframeQuiz.querySelector("#hold");
				for(var i = 0; i < textAreas.length; i+=2){
					const mainDiv = iframeQuiz.appendChild(document.createElement("div"));
					const textDiv = mainDiv.appendChild(document.createElement("div"));
					const joinDiv = mainDiv.appendChild(document.createElement("div"));
					const dragDiv = mainDiv.appendChild(document.createElement("div"));

					const mainDragDiv = iframHold.appendChild(document.createElement("div"));
					
					joinDiv.appendChild(document.createElement("p")).innerText = "-";
					textDiv.appendChild(document.createElement("p")).innerText = textAreas[i].value;
					mainDragDiv.appendChild(document.createElement("p")).innerText = textAreas[i+1].value;
					
					mainDiv.id = `${i/2}`;

					mainDiv.classList.value = "row";
					joinDiv.classList.value = "col-1 mx-auto";
					textDiv.classList.value = "col-5 mx-auto";
					dragDiv.classList.value = "col-5 mx-auto drag";
					mainDragDiv.classList.value = "drag";
				}
			});
			break;
		case 3:
			templateWrite("/templates/order.html", (iframeQuiz, textAreas) => {
				textAreas.forEach((e, i) => {
					const mainDiv = iframeQuiz.appendChild(document.createElement("div"));
					const numDiv = mainDiv.appendChild(document.createElement("div"));
					const textDiv = mainDiv.appendChild(document.createElement("div"));

					numDiv.appendChild(document.createElement("p")).innerText = `${i+1}.`;
					textDiv.appendChild(document.createElement("p")).innerText = e.value;
				
					mainDiv.classList.value = "row";
					mainDiv.id = `${i}`;

					numDiv.classList.value = "col-1 mx-auto";
					textDiv.classList.value = "col-11 mx-auto drag";
				});
			});
			break;
		case 4:
			templateWrite("/templates/map.html", (iframeQuiz) => {
				
			});
			break;
	}
}

if(location.protocol == "file:"){
	alert("Ez az oldal nem elérhető szerver nélkül (és valószínűleg egy lusta programozó miatt tudtad elérni)");
	window.history.back();
}

loadThings(false, true);