
var functionType = {
	'TRANSFER'		: 1,
	'QUERY'			: 2,
	'ADDUSER'		: 3,
	'BLOCKDATA' 	: 4,
	'BLOCKNUMBER' 	: 5,
	'DEPOSIT'       : 6,
	'QUERY_DASHBOARD': 7,
	'GETSERVICEHISTORY': 8
}
var chaincode = {
	//car1, car2
	'USER'		: "3606ca94ffef3a1d3be43923f3651a15cd1f9456fbf80b7b6d415024339e96e7a7173a3d784c0d8a3495f37a89df6bf24d3a830b35fa241edf5cf38f8e0e0899",
	'PARKING' 	: "03d578243c5c7176ca8f968931f88b90cf9f6ea6a33d330e2a86417d3f689b20b906a07cc55096335d09b244f1ee23d4b6bffc4963bdfbd7db2023f467d7a4db",
	'CARWASH' 	: "35f13c114e1c01b695ad27dffbd652519c008e475244aca1fc476f2450a9716f6cf7e0a11ccd11381f8d4ce4738dcf08139e8b758f8b3803ce73427ab9a91356",
	'TOLL'		: "a4881970fef277137a943c3db3bbca9edaac928f123b5fe34f6add93fe94e9209c24775e5d9242578a331bda252523d68ecd7ded941e0a806ecfa925eb66f39b",
	'UBER'		: "9f5c99265f9d21a773ddc9174c2cc250d4a778bcc57abeaff944695df0e97c59f13c957ed8743a3d60823e5a7a5c812ef793e40889da1ceb365842f6c6f62873"
}
var userInfo = {
	'secureContext' : "user_type1_2",
	'secureContext0' : "user_type1_0"
}

var deviceInfo = {
	'DEVICE_TOLL' : "http://10.223.116.20:5000/"
	//'DEVICE_CARWASH' : "http://10.223.90.99:5000/"
}

var priceInfo = {
	'PRICE_PARKING' : "10",
	'PRICE_CARWASH' : "50"
}

var userList = [
	"5b3133362c20342c203234352c203130392c2032305d",
	"5b38362c2039302c2033382c203132362c2038345d",
	"5b36312c203139322c2033392c2039382c203138345d",
	"car1",
	"car2",
	"car3",
	"car4" 
]

var latestStoredRFID = new Date();
var result_bluemix = -1;
var UPDATEDASH_FLAG = 0;
var NUM_USER = 4 + userList.length;
var TRANS_COUNT = 0;
var BLOCKS_LENGTH = 0;

function checkNewData() {
	Object.keys(deviceInfo).forEach(function(key,index) {

		$.ajax({
			type: "GET",
			url: deviceInfo[key] + "rfid/",
			contentType: "application/json",
			dataType: "json",
			success: function (response,tag) {
				receiveRFID(response)
			},
			error: function (response,tag) {
				// console.log(response)
			}
		});
	});
}

//TODO seperate newdate for different device
function receiveRFID(response){
	for (var i = response.length-1; i >=0 ; i--) {
		var currentTime = new Date(Date.parse(response[i].timestamp))
		// console.log(latestStoredRFID)
		// console.log(currentTime)
		if(currentTime > latestStoredRFID){
			//Success find new RFID
			latestStoredRFID = currentTime
			console.log("Update timestamp" + latestStoredRFID)
			showLCD("transaction", "processing")
			transfer(response[i].cardUID, "toll", 10)
		}
	}
}

function transfer(sender, receiver, amount) {
	//alert(sender+receiver+amount)
	result_bluemix= -1;
	if(!isNaN(amount)&amount!=""){
		var chaincodeID = chaincode.USER;

		if(receiver == "parking") {
			chaincodeID = chaincode.PARKING;
		} else if(receiver == "carwash") {
			chaincodeID = chaincode.CARWASH;
		} else if(receiver == "toll") {
			chaincodeID = chaincode.TOLL;
		} else if(receiver == "uber") {
			chaincodeID = chaincode.UBER;
		}

		var jsonForSender = {
			"jsonrpc": "2.0",
			"method": "invoke",
			"params": {
				"type": 1,
				"chaincodeID": {
					"name": chaincode.USER
				},
				"ctorMsg": {
					"function": "change_money",
					"args": [
						sender,  '-' + amount
					]
				},
				"secureContext": userInfo.secureContext
			},
			"id": 2
		};

		var jsonForReceiver = {
			"jsonrpc": "2.0",
			"method": "invoke",
			"params": {
				"type": 1,
				"chaincodeID": {
					"name" : chaincodeID
				},
				"ctorMsg": {
					"function": "change_money",
					"args": [
						receiver, amount
					]
				},
				"secureContext": userInfo.secureContext
			},
			"id": 2
		};
		query(sender);
		if(result_bluemix>=amount){
			TRANS_COUNT = 0;
			sendRequest(functionType.TRANSFER, jsonForSender);
			sendRequest(functionType.TRANSFER, jsonForReceiver);
		}
		else{
			alert("Sorry! Deposit insufficient")
		}
	}
	else{
		alert("Only numbers allowed, please input again");
	}

}

function query(userName) {

	var chaincodeID = chaincode.USER;
	if(userName == "parking") {
		chaincodeID = chaincode.PARKING;
	} else if(userName == "carwash") {
		chaincodeID = chaincode.CARWASH;
	} else if(userName == "toll") {
		chaincodeID = chaincode.TOLL;
	} else if(userName == "uber") {
		chaincodeID = chaincode.UBER;
	}

	var json =
	{
		"jsonrpc": "2.0",
		"method": "query",
		"params": {
			"type": 1,
			"chaincodeID": {
				"name": chaincodeID
			},
			"ctorMsg": {
				"function": "query",
				"args": [
					userName
				]
			},
			"secureContext": userInfo.secureContext
		},
		"id": 1
	};
	sendRequest(functionType.QUERY, json);
}

function sendRequest(type, inputJSON) {

	$.ajax({
		type: "POST",
		url: "https://6128a651373e479f968b58f35ea9b7cb-vp2.us.blockchain.ibm.com:5001/chaincode",
		contentType: "application/json",
		async:false,
		dataType: "json", //type of return value
		data: JSON.stringify(inputJSON),
		success: function (response,tag) {

			if(type == functionType.TRANSFER) { // to transfer
				// console.log(JSON.stringify(response))
				TRANS_COUNT++;
				if(TRANS_COUNT==2){
					showLCD("transaction", "success")
					alert("transfer success!")
				}

			} else if(type == functionType.QUERY) { // to query

				if(response!==null){
					result_bluemix = parseInt(response.result.message);
				}
				// document.getElementById("amount_query").value = response.result.message;
				//console.log(result_bluemix);
				//console.log("name= "+ inputJSON.params.ctorMsg.args[0] + ",balance= " + response.result.message)

			}else if(type == functionType.DEPOSIT){
				alert("Deposit success!");

			}else if(type == functionType.QUERY_DASHBOARD){
				// console.log(response)
				if(UPDATEDASH_FLAG < NUM_USER){
					createTable(inputJSON.params.ctorMsg.args[0], inputJSON.params.chaincodeID.name, response.result.message);
					UPDATEDASH_FLAG++;
				}
			}
		},
		error: function (response,tag) {
			console.log(response)
		}
	});
}

function deposit(userName,amount){
	if(!isNaN(amount)&amount!=""){//amount is number
		var json = {
			"jsonrpc": "2.0",
			"method": "invoke",
			"params": {
				"type": 1,
				"chaincodeID": {
					"name" : chaincode.USER
				},
				"ctorMsg": {
					"function": "change_money",
					"args": [
						userName, amount
					]
				},
				"secureContext": userInfo.secureContext
			},
			"id": 2
		};
		sendRequest(functionType.DEPOSIT,json);
	}
	else{
		alert("Only numbers allowed, please input again");
	}

}

function showLCD(line1, line2){
	$.ajax({
		type: "GET",
		url: deviceInfo.DEVICE_TOLL+"lcd?line1="+line1+"&line2="+line2,
		contentType: "application/json",
		dataType: "json",
		success: function (response,tag) {
		}
	});
}

/* When the user clicks on the button, 
 toggle between hiding and showing the dropdown content */
function dropDownFunction(dropdownID) {
	document.getElementById(dropdownID).classList.toggle('show');
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
	if (!event.target.matches('.dropbtn')) {

		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}

function setUserinDropdown(userID, funcName) {
	document.getElementById(funcName).value = userID;
	document.getElementById(funcName).innerHTML =userID;
}

function updateBlockInfo(){
	var panelDiv = document.getElementById("panelDiv")
	panelDiv.innerHTML = "";

	sendGetRequest(functionType.BLOCKNUMBER, 0)
	for(i = BLOCKS_LENGTH-1; i >= BLOCKS_LENGTH-10; i--) {
		sendGetRequest(functionType.BLOCKDATA, i)
	}

	showPage()
}

function sendGetRequest(type, blockNumber) {//To get the number of blocks , input 0 at blocknumber
	var url = "https://6128a651373e479f968b58f35ea9b7cb-vp2.us.blockchain.ibm.com:5001/chain"
	if(type !== functionType.BLOCKNUMBER) {
		url = "https://6128a651373e479f968b58f35ea9b7cb-vp2.us.blockchain.ibm.com:5001/chain/blocks/" + blockNumber
	}
	$.ajax({
		type: "GET",
		url: url,
		contentType: "application/json",
		async: false,
		dataType: "json", //type of return value
		success: function (response,tag) {
			if(type == functionType.BLOCKDATA) { // GET Block data
				//console.log("blockid: " + blockNumber)
				createBlock(blockNumber, response.transactions)

			} else if(type == functionType.BLOCKNUMBER) { // GET Blocks length
				//console.log("The number of blocks : " + response.height)
				BLOCKS_LENGTH = response.height
			} else if(type == functionType.GETSERVICEHISTORY){
				processHistoryData(response.transactions)
			}
		}
	});
}

function createBlock(blockid, transactionData){
	var panelDiv = document.getElementById("panelDiv")
	var html = panelDiv.innerHTML;
	html += '<div class="panel panel-info panel-custom"><div class="panel-heading">'+blockid+ '</div><div class="panel-body">';

	for(j = 0; j < transactionData.length; j++) {
		//0~141 : Chaincode ID
		var payload = atob(transactionData[j].payload)
		var date = new Date(1000 * transactionData[j].timestamp.seconds)
		html += "<p>";
		html += date + "<br>";
		html += transactionData[j].txid + "<br>";
		html += atob(transactionData[j].chaincodeID) + "<br>";
		html += "<b>" + payload.substr(141, payload.length) + "</b><br>";
		html += "</p>";
	}
	html += "</div></div>";
	panelDiv.innerHTML = html;
}

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("panelDiv").style.display = "block";
}

function updateDashboard(){
	UPDATEDASH_FLAG = 0;
	var table = document.getElementById("innerTable");
	table.innerHTML = "";
	for(var i = 0; i < userList.length; i++){
		queryDashboard(userList[i]);
	}
	queryDashboard("carwash");
	queryDashboard("parking");
	queryDashboard("toll");
	queryDashboard("uber");

}

function queryDashboard(userName) {

	var chaincodeID = chaincode.USER;
	if(userName == "parking") {
		chaincodeID = chaincode.PARKING;
	} else if(userName == "carwash") {
		chaincodeID = chaincode.CARWASH;
	} else if(userName == "toll") {
		chaincodeID = chaincode.TOLL;
	} else if(userName == "uber") {
		chaincodeID = chaincode.UBER;
	}

	var json =
	{
		"jsonrpc": "2.0",
		"method": "query",
		"params": {
			"type": 1,
			"chaincodeID": {
				"name": chaincodeID
			},
			"ctorMsg": {
				"function": "query",
				"args": [
					userName
				]
			},
			"secureContext": userInfo.secureContext
		},
		"id": 1
	};
	sendRequest(functionType.QUERY_DASHBOARD, json);
}

function createTable(service, id, balance){
	var table = document.getElementById("innerTable");
	var row = table.insertRow();
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	cell1.innerHTML = service;
	cell2.innerHTML = id;
	cell3.innerHTML = balance;
}

function getServiceHistory(service){
	var table = document.getElementById("innerTable");
	table.innerHTML = "";
	sendGetRequest(functionType.BLOCKNUMBER, 0)
	for(i = BLOCKS_LENGTH-1; i >= BLOCKS_LENGTH-10; i--) {
		sendGetRequest(functionType.GETSERVICEHISTORY, i)
	}
}

function processHistoryData(transactionData){
	if(transactionData.length >=2){
		var date = new Date(1000 * transactionData[0].timestamp.seconds)
		var user = extractUserFromData(atob(transactionData[0].payload))
		var service = extractUserFromData(atob(transactionData[1].payload))
		
		if(!service[2].localeCompare("toll")){
			createHistoryTable(date, user[2], service[2], service[3])
		}
	}
}

function extractUserFromData(data){
	var user = data.substr(141).split(/\s+/)
	return user
}

function createHistoryTable(time, service, id, balance){
	var table = document.getElementById("innerTable");
	var row = table.insertRow();
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	cell1.innerHTML = time;
	cell2.innerHTML = service;
	cell3.innerHTML = id;
	cell4.innerHTML = balance;
}

function addUser(userName, amount) {
	var inputJSON =
	{
		"jsonrpc": "2.0",
		"method": "invoke",
		"params": {
			"type": 1,
			"chaincodeID": {
				"name": chaincode.USER
			},
			"ctorMsg": {
				"function": "create_user",
				"args": [
					userName, amount
				]
			},
			"secureContext": userInfo.secureContext
		},
		"id": 2
	};

	$.ajax({
		type: "POST",
		//vp2
		url: "https://6128a651373e479f968b58f35ea9b7cb-vp2.us.blockchain.ibm.com:5001/chaincode",
		contentType: "application/json",
		async:false,
		dataType: "json", //type of return value
		data: JSON.stringify(inputJSON),
		success: function (response,tag) {

		}
	});
}