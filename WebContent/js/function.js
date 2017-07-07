/**
 * Function for blockchain
 */
var functionType = {
	'TRANSFER'	: 1,
	'QUERY'		: 2,
	'ADDUSER'	: 3
}
var chaincode = {
		//car1, car2
		'USER'		: "3606ca94ffef3a1d3be43923f3651a15cd1f9456fbf80b7b6d415024339e96e7a7173a3d784c0d8a3495f37a89df6bf24d3a830b35fa241edf5cf38f8e0e0899",
		//parking
		'PARKING' 	: "03d578243c5c7176ca8f968931f88b90cf9f6ea6a33d330e2a86417d3f689b20b906a07cc55096335d09b244f1ee23d4b6bffc4963bdfbd7db2023f467d7a4db",
		//carwash
		'CARWASH' 	: "35f13c114e1c01b695ad27dffbd652519c008e475244aca1fc476f2450a9716f6cf7e0a11ccd11381f8d4ce4738dcf08139e8b758f8b3803ce73427ab9a91356",
		//toll
		'TOLL'		: "a4881970fef277137a943c3db3bbca9edaac928f123b5fe34f6add93fe94e9209c24775e5d9242578a331bda252523d68ecd7ded941e0a806ecfa925eb66f39b",
		//uber
		'UBER'		: "9f5c99265f9d21a773ddc9174c2cc250d4a778bcc57abeaff944695df0e97c59f13c957ed8743a3d60823e5a7a5c812ef793e40889da1ceb365842f6c6f62873"
}
var userInfo = {
		'secureContext' : "user_type1_1",
	    'secureContext0' : "user_type1_0"
}

var deviceInfo = {
		'DEVICE_PARKING' : "http://10.223.90.227:5000/rfid/",
		'DEVICE_CARWASH' : "http://10.223.90.179:5000/rfid/"
}

var priceInfo = {
		'PRICE_PARKING' : "",
		'PRICE_CARWASH' : ""
}


var latestStoredRFID = new Date(2017,5,22);

/**
 Response Example
 --------------------------------------------------------
  Success : 
 {
  "jsonrpc": "2.0",
  "result": {
    "status": "OK",
    "message": "a38e610c-b1f2-4985-970c-d5198c788ed4"
  },
  "id": 2
}
---------------------------------------------------------
  Error :
    {
  "jsonrpc": "2.0",
  "error": {
    "code": -32700,
    "message": "syntax error",
    "data": "detail"
  },
  "id": 123
}
 ---------------------------------------------------------
 */
function checkNewData(deviceURL) {
	window.setInterval(function(){
		$.ajax({
			type: "GET",
			url: deviceURL ,
			contentType: "application/json",
			dataType: "json",
			success: function (response,tag) {
				//alert(JSON.stringify(response))
				receiveRFID(response)
			}
		});
	}, 3000);
}

function sendRequest(type, inputJSON) {
    $.ajax({
        type: "POST",
        //vp1
        url: "https://6128a651373e479f968b58f35ea9b7cb-vp1.us.blockchain.ibm.com:5001/chaincode",
        //vp0
        //url: "https://6128a651373e479f968b58f35ea9b7cb-vp0.us.blockchain.ibm.com:5001/chaincode",
        contentType: "application/json", //必须有
        dataType: "json", //type of return value
        data: JSON.stringify(inputJSON),
        success: function (response,tag) {
        	//TODO showing message of the result after get response
        	if(type == functionType.TRANSFER) { // to transfer
        		console.log(JSON.stringify(response))
        		showLCD(response.result.status, "Transfer success")
        		//alert(response.result.status)
        		//galert(JSON.stringify(response))
        	} else if(type == functionType.QUERY) { // to query
        		//alert(JSON.stringify(response))
        		document.getElementById("amount_query").value = response.result.message;
        		console.log(inputJSON.params.ctorMsg.args[0])
        		console.log(response.result.message)
        		showLCD(inputJSON.params.ctorMsg.args[0],response.result.message)
        	} else if(type == functionType.ADDUSER) { // to add user
        		//alert(response.result.status)
        	}
        }
    });
}

function transfer(sender, receiver, amount) {
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
	sendRequest(functionType.TRANSFER, jsonForSender);
	sendRequest(functionType.TRANSFER, jsonForReceiver);
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
/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction(dropdownID) {
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



function receiveRFID(response){
	for (var i = response.length-1; i >=0 ; i--) {
    	var currentTime = new Date(Date.parse(response[i].timestamp))
    	//console.log(latestStoredRFID)
    	if(currentTime > latestStoredRFID){//Success find new RFID
    		latestStoredRFID = currentTime
    		console.log("Update timestamp" + latestStoredRFID)
    		//transfer(response[i].cardUID, "parking", 10)
    		
    		query(response[i].cardUID)
    	}
	}
}

function showLCD(userName, balance){
	 $.ajax({
        type: "GET",
        url: "http://10.223.90.210:5000/lcd?line1="+userName+"&line2="+balance,
        contentType: "application/json",
        dataType: "json",
        success: function (response,tag) {
            console.log("success")
        }
    });
}
/*
function addUser(userName, amount) {
	var json =
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
	
	sendRequest(functionType.ADDUSER, json);
}
*/
