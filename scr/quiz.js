const next = document.getElementById("next");
next.style.display = "none";

const prev = document.getElementById("prev");

const link = decodeURI(window.location.href);
const startIndex = link.lastIndexOf("/") + 1;
const endIndex = link.lastIndexOf(".html");
const curNum = parseInt(link.substring(startIndex, endIndex)) - 1;

const startIndex2 = link.indexOf("quizes/") + "quizes/".length;
const endIndex2 = link.indexOf("/", startIndex2);
const curName = link.substring(startIndex2, endIndex2);

const curElement = data.find(e => e.name == curName);

const answers = curElement.good[curNum];

const curNumTooBig = (curElement.max_page == curNum+1);
const curNumTooSmall = (curNum) <= 0;

const quiz = document.getElementById("quiz");
const quizType = parseInt(quiz.getAttribute("t"));

const jump = document.getElementById("jump");

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

function sortFix(e){
	if(e.value != ""){
		const parent = e.parentElement;
		const divs = parent.parentElement.children;
		for(var i = 0; i < divs.length; i++){
			const div = divs[i];
			if(div.firstElementChild.value == e.value && div != parent){
				div.firstElementChild.oldVal = div.firstElementChild.value = e.oldVal;
				e.oldVal = e.value;
				return;
			}
		}
	}
}

function check(e){
	function goodFinish(){
		alert("jó válasz");
		e.style.display = "none";
		next.style.display = "";
	}

	var good = false;

	switch(quizType){
		case 0: // jelölő gombok
			const checks = quiz.querySelectorAll("input:checked");
			if(checks.length == answers.length){
				good = true;
				checks.forEach(e => {
					if(!answers.includes(parseInt(e.id))) {
						good = false;
						return;
					}
				});
			}
			break;
		case 1: // rádió gombok
			const radio = quiz.querySelector("input:checked");
			good = radio.id == answers;
			break;
		case 2: //párba rakós
			good = true;
			const rows = quiz.children;
			for(var i = 0; i < rows.length; i++){
				const row = rows[i];
				const child = row.querySelector("div:last-child");
				if(answers[row.id] != child.children[0].innerText){
					good = false;
					break;
				}
			}
			break;
		case 3: //sorba rakós
			const num_checks = quiz.querySelectorAll("select");
			good = true;
			num_checks.forEach(e => {
				if(e.value != e.nextElementSibling.getAttribute("for")){
					good = false;
					return;
				}
			});
			break;
		case 4:
			break;
		case 5:
			break;
	}
	
	if(good) goodFinish();
	else if(confirm("Rossz válasz!\nSzabad a gazda?")){
		switch(quizType){
			case 0:
				const checks = quiz.querySelectorAll("input");
				checks.forEach(e => e.checked = answers.includes(parseInt(e.id)));
				break;
			case 1:
				const radios = quiz.querySelectorAll("input");
				radios.forEach(e => {
					if(e.id == answers){
						e.checked = true;
						return;
					}
				});
				break;
			case 2:
				const rows = quiz.children;
				for(var i = 0; i < rows.length; i++){
					const row = rows[i];
					const child = row.querySelector("div:last-child");
					child.children[0].innerText = answers[row.id];
				}
				break;
			case 3:
				const num_checks = quiz.querySelectorAll("select");
				num_checks.forEach(e => e.value = e.nextElementSibling.getAttribute("for"));
				break;
			case 4: // map stored in check.map
				L.geoJSON(answers).addTo(check.map);
				break;
		}
		setTimeout(goodFinish, 50);
	}
}

if(curNumTooBig) next.disabled = true;
else next.addEventListener("click", nextLink);

if(curNumTooSmall) prev.disabled = true;
else prev.addEventListener("click", prevLink);

for(var i = 1; i <= curElement.max_page; i++){
	const div = jump.appendChild(document.createElement("div"));
	div.classList.add("p-sm-2", "px-sm-3", "p-1", "px-2", "mx-sm-2", "mx-1");
	const a = div.appendChild(document.createElement("a"));
	a.href = `../../quizes/${curName}/${i}.html`;
	a.innerText = i;
}

switch(quizType){
	case 2:
		var activeE = null;
		onpointermove = e => {
			if(activeE != null){
				activeE.style.top = `${parseFloat(activeE.style.top) + e.movementY}px`;
				activeE.style.left = `${parseFloat(activeE.style.left) + e.movementX}px`;
			}
		};
		onpointerup = () => {
			if(activeE != null){
				quiz.removeChild(activeE);
				activeE = null;
			}
		};

		const lasts = quiz.querySelectorAll(".col-5:last-child");
		lasts.forEach(e => {
			e.addEventListener("pointerdown", ev => {
				activeE = e.cloneNode(true);
				
				const width = window.getComputedStyle(e).width;
				const height = window.getComputedStyle(e).height;

				activeE.style.position = "fixed";
				activeE.style.top = `${ev.pageY - (parseFloat(height)/2)}px`;
				activeE.style.left = `${ev.pageX - (parseFloat(width)/2)}px`;
				activeE.style.width = width;
				activeE.style.height = height;
				quiz.appendChild(activeE);
			});
		});
		break;
	case 3:
		const temp = document.getElementById("temp");
		for(var i = 0; i < quiz.children.length; i++){
			const newTemp = temp.content.children[0].cloneNode(true);
			newTemp.oldVal = "";
			newTemp.id = i;
			quiz.children[i].prepend(newTemp);
		}
	case 1: // rádió
	case 0: // jelölő, sorrend elemek randomizálása
		shuffle(quiz);
		break;
	case 4:
		const map = new L.map('quiz', {
			center: [47.487667, 19.080785],
			zoom: 11.2,
			worldCopyJump: true,
		});

		check.map = map;

		/*L.geoJSON(coordsJSON, {
			onEachFeature: onEachFeature,
			pointToLayer: pointToLayer
		}).addTo(map);*/
		
		const domainNum = quiz.getAttribute("d");
		var tileDomain;
		switch(domainNum){
			case "0": tileDomain = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'; break;
			case "1": tileDomain = 'https://tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; break;
			case "2": tileDomain = 'https://tile.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'; break;
		}

		new L.tileLayer(tileDomain, {
			attribution: `${((domainNum != "0")?'&copy; <a href="https://carto.com/attributions">CARTO</a>':'')} &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
		}).addTo(map);
		break;
}