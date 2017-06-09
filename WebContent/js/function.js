/**
 * Function for blockchain
 */
var functionType = {
	'TRANSFER'	: 1,
	'QUERY'		: 2,
	'ADDUSER'	: 3
}
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
function sendRequest(type, inputJSON) {
    $.ajax({
        type: "POST",
        //peer url(found in bluxmix peer)
        url: "https://36c591183e7a4d3aad72788dea9dcaa9-vp0.us.blockchain.ibm.com:5004/chaincode",
        contentType: "application/json", //必须有
        dataType: "json", //type of return value
        data: JSON.stringify(inputJSON),
        success: function (response,tag) {
        	if(type == functionType.TRANSFER) { // to transfer
        		alert(response.result.status)
        	} else if(type == functionType.QUERY) { // to query
        		alert(response.result.message)
        	} else if(type == functionType.ADDUSER) { // to add user
        		alert(response.result.status)
        	}
        }
    });
}

function transfer(sender, receiver, amount) {
	 var json =
     {
         "jsonrpc": "2.0",
         "method": "invoke",
         "params": {
             "type": 1,
             "chaincodeID": {
                 "name": "5078ced08aaf2b64718ccdf705b6f32f08b629f99ba77472757b49594b20955d6b8d441764567a3dd12de085da899426a45b3b0a2cb93d81df6e404ceca6c1ff"
             },
             "ctorMsg": {
                 "function": "write",
                 "args": [
                     sender, receiver, amount
                 ]
             },
             "secureContext": "user_type1_0"
         },
         "id": 2
     };
	 sendRequest(functionType.TRANSFER,json);
}

function query(userName) {
	var json =
    {
        "jsonrpc": "2.0",
        "method": "query",
        "params": {
            "type": 1,
            "chaincodeID": {
                "name": "5078ced08aaf2b64718ccdf705b6f32f08b629f99ba77472757b49594b20955d6b8d441764567a3dd12de085da899426a45b3b0a2cb93d81df6e404ceca6c1ff"
            },
            "ctorMsg": {
                "function": "query",
                "args": [
                    userName
                ]
            },
            "secureContext": "user_type1_0"
        },
        "id": 1
    };
	sendRequest(functionType.QUERY, json);
}

function addUser(userName, amount) {
	var json =
    {
        "jsonrpc": "2.0",
        "method": "invoke",
        "params": {
            "type": 1,
            "chaincodeID": {
                "name": "5078ced08aaf2b64718ccdf705b6f32f08b629f99ba77472757b49594b20955d6b8d441764567a3dd12de085da899426a45b3b0a2cb93d81df6e404ceca6c1ff"
            },
            "ctorMsg": {
                "function": "add",
                "args": [
                    userName, amount
                ]
            },
            "secureContext": "user_type1_0"
        },
        "id": 2
    };
	
	sendRequest(functionType.ADDUSER, json);
}

