const test = document.getElementById("test");

/*fetch('scr/topics.js', { //dynamic read
	mode: 'cors',
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Content-Type": "text/javascript",
		"Content-Security-Policy": "script-src scr/topics.js"
	},
	credentials: "include",
	method: "GET",
	referrerPolicy: "unsafe-url"
})
.then(async response => {
	const text = new TextDecoder().decode((await response.body.getReader().read()).value);
	const a = JSON.parse(text.substring(11, text.length));
	console.log(a)
})
.catch(err => console.error(err));

console.log(data); //read

function testWrite(){ //write
	fetch('', {
		method: 'POST',
		headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
		},
		body: JSON.stringify([{"name":"handmade_oof","max_page":1,"subs":[]}])
	})
	.then(() => window.location.reload())
	.catch(err => console.error(err));
}*/

function createListItem(data, currentOl){
	const newList = currentOl.appendChild(document.createElement("li"));

	const a = newList.appendChild(document.createElement("a"));
	a.innerText = data.name;

	/*const link = window.location.href;
	const endIndex = link.indexOf("index.html")-1;
	a.href = `${link.substring(0, endIndex)}/quizes/${data.name}/index.html`;*/
	a.href = `/quizes/${data.name}/index.html`;
	
	if(data.subs.length != 0){
		newList.appendChild(document.createElement("ol"))
		data.subs.forEach(e => {
			createListItem(e, newList.lastChild);
		}); 
	}
}

data.forEach(e => {
	createListItem(e, test);
})