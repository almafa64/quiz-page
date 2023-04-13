const next = document.getElementById("next");
const prev = document.getElementById("prev");

const link = window.location.href;
const startIndex = link.lastIndexOf("/") + 1;
const endIndex = link.lastIndexOf(".html");
const curNum = parseInt(link.substring(startIndex, endIndex));

const startIndex2 = link.indexOf("quizes/") + "quizes/".length;
const endIndex2 = link.indexOf("/", startIndex2);
const curName = link.substring(startIndex2, endIndex2);

const curElement = data.find(e => e.name == curName);

const curNumTooBig = curElement.max_question == curNum;
const curNumTooSmall = (curNum - 1) <= 0;

const test = document.getElementById("test");

function nextLink(){
	window.location.href = `/quizes/${curName}/${curNum+1}.html`;
}
function prevLink(){
	window.location.href = `/quizes/${curName}/${curNum-1}.html`;
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

for(var i = 1; i <= curElement.max_question; i++){
	const a = test.appendChild(document.createElement("div")).appendChild(document.createElement("a"));
	a.href = `/quizes/${curName}/${i}.html`;
	a.innerText = i;
	a.parentElement.classList.add("p-1");
}