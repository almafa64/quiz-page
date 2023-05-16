const test = document.getElementById("test");

function createListItem(data, currentOl, newText = ""){
	const newList = currentOl.appendChild(document.createElement("li"));
	const newerText = newText + data.name;

	const a = newList.appendChild(document.createElement("a"));
	a.innerText = data.name;

	if(data.no == undefined || data.no == 0) a.href = `quizes/${newerText}/index.html`;
	
	if(data.subs.length != 0){
		newList.appendChild(document.createElement("ol"))
		data.subs.forEach(e => {
			createListItem(e, newList.lastChild, `${newerText}_`);
		}); 
	}
}

files.forEach(e => {
	createListItem(e, test);
})