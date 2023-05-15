const type = document.getElementById("type");
const hold = document.getElementById("hold");
const saveBut = document.getElementById("save");
const webHold = document.getElementById("webHold");
const topicHold = document.getElementById("topicHold");

const topicList = document.getElementById("topic");
const topicListName = document.getElementById("topicName");
const topicDesc = document.getElementById("topicDesc");
const quizList = document.getElementById("question");
const quizListName = document.getElementById("questionName");

var dataScript = null;
var filesScript = null;

var quizType = null;
var topicName = "";
var quizNum = -1;

var files = [];
var data = undefined;

String.prototype.insertAt = function(index, text, rem = 0) {
	return this.substring(0, index) + text + this.substring(index + rem, this.length);
}

function parseMarkdown(text){
	function replace(value, left, right){
		const diff = left.length - value.length;
		const toDelete = value.length;

		var lastNext = 0;
		while(true){
			const current = text.indexOf(value, lastNext);
			if(current == -1) break;
			const next = text.indexOf(value, current + 1);
			if(next == -1) break;

			lastNext = next + diff;

			text = text.insertAt(current, left, toDelete);
			text = text.insertAt(lastNext, right, toDelete);
		}
	}
	replace("**", "<b>", "</b>");
	replace("*", "<i>", "</i>");
	replace("~~", "<del>", "</del>");
	replace("__", "<u>", "</u>");
	return text;
}

function deParseMarkdown(text){
	return text.replace(/<b>|<\/b>/gi, "**").replace(/<i>|<\/i>/gi, "*").replace(/<del>|<\/del>/gi, "~~").replace(/<u>|<\/u>/gi, "__");
}

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

function addRow(leftText = "", rightText = "", selected = false){ // "mégegy sor hozzáadása" gomb addRow.button-ban van tárolva
	if(isNaN(quizType)) return false;

	const div = hold.appendChild(document.createElement("div"));
	const leftArea = document.createElement("textarea");
	leftArea.value = leftText;
	const span = document.createElement("span");
	span.innerText = `${hold.childElementCount - (hold.firstElementChild == addRow.button ? 1 : 0)}, `;
	div.append(span, leftArea);

	switch(quizType){
		case 0:
			const checkbox = div.appendChild(document.createElement("input"));
			checkbox.type = "checkbox";
			checkbox.name = "a";
			checkbox.checked = selected;
			break;
		case 1:
			const radio = div.appendChild(document.createElement("input"));
			radio.type = "radio";
			radio.name = "a";
			radio.checked = selected;
			break;
		case 2: // párba
			const rightArea = document.createElement("textarea");
			rightArea.value = rightText;
			div.append(" - ", rightArea);
			break;
		case 4: // térkép
			alert("no");
			break;
	}

	const deleteButton = div.appendChild(document.createElement("button"));
	deleteButton.type = "button";
	deleteButton.innerText = "Törlés";
	deleteButton.onclick = () => {
		if(hold.childElementCount == 1){
			hold.appendChild(deleteButton.parentElement.lastElementChild);
			deleteButton.parentElement.remove();
			return;
		}

		const bros = [...hold.children]

		if(deleteButton.parentElement == last(bros)){
			bros[bros.length-2].appendChild(deleteButton.parentElement.lastElementChild);
		}

		const thisNum = parseInt(deleteButton.parentElement.firstElementChild.innerText);
		deleteButton.parentElement.remove();
		for(var i = thisNum; i < bros.length; i++){
			const bro = bros[i];
			const text = bro.firstElementChild.innerText;
			bro.firstElementChild.innerText = `${i}${text.substring(text.indexOf(","))}`;
		}
	};

	if(addRow.button == undefined){
		const button = div.appendChild(document.createElement("button"));
		button.innerText = "mégegy sor hozzáadása";
		button.type = "button";
		button.addEventListener("click", e => {
			addRow();
		});
		addRow.button = button;
	}
	else div.appendChild(addRow.button);

	return true;
}

function changeType(){
	quizType = parseInt(type.value);
	hold.innerHTML = "";
	addRow();
}

function changeTopic(){
	const empty = quizList.firstElementChild;
	topicDesc.value = type.value = hold.innerHTML = quizListName.value = quizList.innerHTML = "";
	quizList.appendChild(empty);

	if(topicList.value != ""){
		const text = topicList.selectedOptions[0].innerText;
		topicName = encodeSlash(text);
		topicListName.value = text;
		topicDesc.disabled = quizList.disabled = quizListName.disabled = type.disabled = saveBut.disabled = false;
		topicHold.src = `/quizes/${topicName}/index.html`;
	}
	else{
		topicListName.value = topicName = "";
		topicDesc.disabled = quizList.disabled = quizListName.disabled = type.disabled = saveBut.disabled = true;
		topicHold.src = "/templates/topic.html";
	}
}

function changeQuiz(){
	hold.innerHTML = "";

	if(quizList.value != ""){
		quizNum = parseInt(quizList.value);

		webHold.src = `/quizes/${topicName}/${quizNum+1}.html`;
		webHold.onload = () => {
			quizListName.value = webHold.contentDocument.getElementById("question").innerText;
			const iframeQuiz = webHold.contentDocument.getElementById("quiz");
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
					webHold.contentDocument.getElementById("hold").querySelectorAll("p").forEach((e, i) => {
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
		quizNum = -1;
		type.value = quizListName.value = "";
	}
}

topicListName.oninput = (e) => { // lastLength topicListName-ben van tárolva
	var text = topicListName.value;

	const cursorPos = e.target.selectionStart - 1;
	const currentChar = text[cursorPos];

	if(/[#%&{}<>*?$!'":@+`|=_]/gi.test(currentChar)){
		alert(`Nem lehet "${currentChar}" a téma nevében`);
		topicListName.value = text = text.insertAt(cursorPos, "", 1)
		e.target.selectionEnd = e.target.selectionStart = cursorPos;
	}

	if(text.length == 0){
		topicDesc.disabled = quizList.disabled = quizListName.disabled = type.disabled = true;
		if(topicList.value == "") saveBut.disabled = true;
	}
	else{
		topicDesc.disabled = quizList.disabled = quizListName.disabled = type.disabled = false;
		if(topicList.value == "") saveBut.disabled = false;
		if(quizList.childElementCount != 1 && currentChar == "/"){
			const tmp = quizList.firstElementChild;
			quizList.innerHTML = "";
			quizList.appendChild(tmp);
			topicHold.src = "/templates/topic.html";
		}
	}

	topicListName.lastLength = text.length;
}

topicHold.onload = () => {
	const isNotTemplate = !topicHold.src.includes("/templates/topic.html");
	if(topicName != "" && isNotTemplate) topicDesc.value = deParseMarkdown(topicHold.contentDocument.getElementById("desc").innerHTML);
	data = topicHold.contentWindow.data;
	loadThings(isNotTemplate);
}

function deleteServerFile(path, quizNum = 0){
	//console.log(`/del?n=${path}&i=${quizNum==0?1:0}${quizNum!=0?"&q="+quizNum:""}`);
	const isQuiz = quizNum != 0;
	fetch(`/del?n=${path}&i=${isQuiz?1:0}${isQuiz?"&q="+quizNum:""}`, {method: 'POST'})
	.then(() => window.location.reload())
	.catch(err => console.error(err));
}

function deleteOldEntry(parent, reload = false){
	parent.splice(last(topicList.value), 1);
	deleteServerFile(topicName, reload);
}

function save(){
	function templateWrite(template, func){
		webHold.src = `/templates/${template}.html`;
		webHold.onload = () => {
			const newTopicName = encodeSlash(topicListName.value);
			const textAreas = hold.querySelectorAll("textarea");

			if(newTopicName.length == 0) {
				deleteOldEntry(multiIndex(files, topicList.value).parent);
				const topicJson = "var files=" + JSON.stringify(files);
				fetch(`/save?n=`, {
					method: 'POST',
					body: JSON.stringify([null, null, topicJson, null])
				})
				.then(() => window.location.reload())
				.catch(err => console.error(err));
				return;
			}
			else if(/([_])\1+|^_|_$/gi.test(newTopicName)) return alert('Nem lehet kettő vagy több "/" egymás mellett és nem lehet "/" a szöveg elején sem végén!');
			else {
				const newPath = newTopicName.split("_");
				const finded = multiIndex(files, topicList.value);

				if( topicName != "" && newPath.length == topicName.split("_").length && topicName != newTopicName) {
					const hasData = (topicDesc.value == "" && textAreas.length == 0) ? 1 : 0;
					finded.element.no = hasData;
					finded.element.name = last(newPath);
					fetch(`/rename?n1=${topicName}&n2=${newTopicName}`, {method: 'POST'}).catch(err => console.error(err));
				}
				else{
					var tmpFiles = files;

					for(var i = 0, n = newPath.length; i < n; i++){
						const currentPath = newPath[i];
						const currentFile = tmpFiles.find(e => e.name == currentPath);

						if(i == n - 1){
							const t = topicName.split("_");
							if(topicName != "" && !newPath.some(e => t.includes(e))) deleteOldEntry(finded.parent); // új téműnak van-e kapcsolata régi témához és ha nincs akkor törlöni
							const hasData = (topicDesc.value == "" && textAreas.length == 0) ? 1 : 0;

							if(currentFile == undefined) tmpFiles.push({name: currentPath, subs: [], no: hasData});
							else currentFile.no = hasData;
						}
						else{
							if(currentFile == undefined) {
								tmpFiles.push({name: currentPath, subs: [], no: 1});
								tmpFiles = last(tmpFiles).subs;
							}
							else tmpFiles = currentFile.subs;
						}
					}
				}
			}
			
			if(data == undefined) data = topicHold.contentWindow.data;
			if(quizNum == -1) quizNum = data.max_page;

			topicName = newTopicName;

			topicHold.contentDocument.getElementsByTagName("title")[0].innerText = topicHold.contentDocument.getElementById("name").innerText = newTopicName.substring(newTopicName.lastIndexOf("_") + 1);
	
			const topicText = topicHold.contentDocument.documentElement.outerHTML.replace(/[^\S ]/g, "");
			const startIndex = topicText.indexOf('"desc">') + '"desc">'.length;
			const endIndex = topicText.indexOf('</div>', startIndex);
			const topicHtml = "<!DOCTYPE html>" + topicText.insertAt(startIndex, parseMarkdown(topicDesc.value), endIndex - startIndex);

			const topicJson = "var files=" + JSON.stringify(files);

			if(template == "empty"){
				const quizJson = `var data={"max_page":${data.max_page},"good":${JSON.stringify(data.good)}}`;
				fetch(`/save?n=${topicName}`, {
					method: 'POST',
					body: JSON.stringify([null, quizJson, topicJson, topicHtml])
				})
				.then(() => window.location.reload())
				.catch(err => console.error(err));
				return;
			}

			if(quizListName.value == ""){
				deleteServerFile(`${topicName}/${quizNum+1}.html`, quizNum+1);
				data.max_page--;
				data.good.splice(quizNum, 1)
				const quizJson = `var data={"max_page":${data.max_page},"good":${JSON.stringify(data.good)}}`;
				fetch(`/save?n=${topicName}&q=${quizNum}`, {
					method: 'POST',
					body: JSON.stringify([null, quizJson, topicJson, topicHtml])
				})
				.then(() => window.location.reload())
				.catch(err => console.error(err));
				return;
			}

			webHold.contentDocument.getElementById("question").innerText = quizListName.value;
			webHold.contentDocument.getElementsByTagName("title")[0].innerText = `${quizNum+1}. Kérdés`;

			const quiz = webHold.contentDocument.getElementById("quiz");
			func(quiz, textAreas);

			const quizHtml = "<!DOCTYPE html>" + webHold.contentDocument.documentElement.outerHTML.replace(/[^\S ]/g, "");
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

			if(data.max_page == quizNum) data.max_page++;

			const quizJson = `var data={"max_page":${data.max_page},"good":${JSON.stringify(data.good)}}`;

			fetch(`/save?n=${topicName}&q=${quizNum}`, {
				method: 'POST',
				body: JSON.stringify([quizHtml, quizJson, topicJson, topicHtml])
			})
			.then(() => window.location.reload())
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
		case null:
			templateWrite("empty", () => {});
			return;
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