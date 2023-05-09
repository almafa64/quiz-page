const type = document.getElementById("type");
const hold = document.getElementById("hold");
const saveBut = document.getElementById("save");
const iframe = document.getElementById("webHold");

const topicList = document.getElementById("topic");
const topicListName = document.getElementById("topicName");
const quizList = document.getElementById("question");
const quizListName = document.getElementById("questionName");

var dataScript = null;
var filesScript = null;

var quizType = -1;
var topicName = "";
var quizNum = -1;

var files = [];

function last(array){
	return array[array.length - 1];
}

function encodeSlash(text){
	return text.replace(/(?<!\\)\//gi, "_");
}

function multiIndex(array, index){
	const indexes = index.split(",");
	var parent;
	
	if(indexes.length == 1){
		parent = array;
	}

	for(var i = 0; i < indexes.length; i++){
		array = array[indexes[i]];
		if(i != indexes.length - 1){
			array = array.subs;
			if(i == indexes.length - 2) parent = array;
		}
	}
	return {element: array, parent: parent};
}

function loadThings(loadFiles = true, loadTopics = false){
	if(loadFiles){
		if(dataScript != null) dataScript.remove();
		dataScript = document.createElement("script");
		
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
		if(filesScript != null) filesScript.remove();
		filesScript = document.createElement("script");

		filesScript.src = "/scr/files.js";
		document.body.appendChild(filesScript);
		filesScript.onload = () => {
			var indexes = [0];

			function recuresion(top, list){
				const tmp = topicList.appendChild(document.createElement("option"));
				
				tmp.value = `${indexes}`;
				tmp.innerText = top;

				if(list.length != 0){
					indexes.push(0);
					list.forEach(e => recuresion(`${top}/${e.name}`, e.subs));
					indexes.pop();
				}

				indexes[indexes.length - 1]++;
			}

			files.forEach(e => recuresion(e.name, e.subs));
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
	addRow();
}

function changeTopic(){
	const empty = quizList.firstElementChild;
	type.value = hold.innerHTML = quizListName.value = quizList.innerHTML = "";
	quizList.appendChild(empty);

	if(topicList.value != ""){
		const text = topicList.selectedOptions[0].innerText;
		topicName = encodeSlash(text);
		topicListName.value = text;
		loadThings();
		quizList.disabled = quizListName.disabled = type.disabled = saveBut.disabled = false;
	}
	else{
		topicListName.value = topicName = "";
		quizList.disabled = quizListName.disabled = type.disabled = saveBut.disabled = true;
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

topicListName.oninput = (e) => {
	var text = topicListName.value;
	if(last(text) == "_") {
		alert('Nem lehet "_" a téma névben');
		text = text.slice(0, -1);
	}

	if(text.length == 0){
		quizList.disabled = quizListName.disabled = type.disabled = true;
		if(topicList.value == "") saveBut.disabled = true;
		else{
			const empty = quizList.firstElementChild;
			type.value = hold.innerHTML = quizListName.value = quizList.innerHTML = "";
			quizList.appendChild(empty);
		}
	}
	else if(text.length = 1) {
		quizList.disabled = quizListName.disabled = type.disabled = false;
		if(topicList.value == "") saveBut.disabled = false;
	}
}

/*quizListName.oninput = (e) => {
	
}*/

function save(){
	function templateWrite(template, func){
		iframe.src = `/template/${template}.html`;
		iframe.onload = () => {
			var newTopicName = topicListName.value;
			if(newTopicName.length == 0) multiIndex(files, topicList.value).parent.splice(last(topicList.value), 1);
			else if(last(newTopicName) == "/") return alert('Nem lehet "/" a téma név végén');
			else if(newTopicName[0] == "/") return alert('Nem lehet "/" a téma név elején');
			else if(/([/])\1+/gi.test(newTopicName)) return alert('Nem lehet kettő vagy több "/" egymás mellett');
			else {
				/*const finded = multiIndex(files, topicList.value);
				const element = finded.element;
				const newPath = newTopicName.split("/");
				var tmpFiles = files;
				for(var i = 0; i < newPath.length; i++){
					const tmpNewPath = newPath[i];
					if(i == newPath.length - 1){
						const tmp = tmpFiles.find(e => e.name == tmpNewPath);
						if(tmp == undefined) tmpFiles = {name: tmpNewPath, subs: []};
						else tmpFiles = tmp;
						//finded.parent.splice(last(topicList.value), 1);
					}
					else{
						const tmp = tmpFiles.find(e => e.name == tmpNewPath);
						if(tmp == undefined) return alert(`Elérési útvonal "${tmpNewPath}" nem létezik`); //insert into files
						tmpFiles = tmp.subs;
					}
				}*/
			}

			console.log(files);

			if(template == "blank"){
				fetch(`/save?n=${topicName}?sM=0`, {
					method: 'POST',
					body: JSON.stringify([null, null, files])
				})
				//.then(() => window.location.reload())
				.catch(err => console.error(err));
				return;
			}

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
			const json = `const data={"max_page":${data.max_page},"good":${JSON.stringify(data.good)}}`;

			fetch(`/save?n=${topicName}&q=${quizNum}`, {
				method: 'POST',
				body: JSON.stringify([html, json, files])
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

	if(quizType == -1){
		templateWrite("blank", () => {});
		return;	
	}

	switch(quizType){
		case 0:
			templateWrite("checkbox", (iframeQuiz, textAreas) => basicType("checkbox", iframeQuiz, textAreas));
			break;
		case 1:
			templateWrite("radio", (iframeQuiz, textAreas) => basicType("radio", iframeQuiz, textAreas));
			break;
		case 2:
			templateWrite("pair", (iframeQuiz, textAreas) => {
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
			templateWrite("order", (iframeQuiz, textAreas) => {
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
			templateWrite("map", (iframeQuiz) => {
				
			});
			break;
	}
}

if(location.protocol == "file:"){
	alert("Ez az oldal nem elérhető szerver nélkül (és valószínűleg egy lusta programozó miatt tudtad elérni)");
	window.history.back();
}

loadThings(false, true);