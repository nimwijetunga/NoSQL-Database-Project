
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCUHhILBU326DJl3gJ3kiPdmWwn9SFlhrI",
    authDomain: "library-database-249f3.firebaseapp.com",
    databaseURL: "https://library-database-249f3.firebaseio.com/",
    storageBucket: "library-database-249f3.appspot.com",
  };

firebase.initializeApp(config);
var database = firebase.database();
var button_ids = new Array();


//Get Data
async function send_data(){

	var name = document.getElementById("Name").value;
	var address = document.getElementById("Address").value;
	var book = document.getElementById("ISBN").value;
	var id = document.getElementById("c_num").value;

	var user_id = database.ref().child('Users').push().key;

	var users = await get_data();


	if(!user_exists(users,id)){
		console.log("User Added!");
		database.ref('Users/'+user_id+'/Id').set(id);
		database.ref('Users/'+user_id+'/Name').set(name);
		database.ref('Users/'+user_id+'/Address').set(address);
		database.ref('Users/'+user_id+'/Books').set(book);
	}else{
	   var done = await update_user(id,book,name,address);
	   console.log("Updated User!");
	}

	general_data();
}


//Get table data
async function general_data(){
	var users = await get_data();
	var tbody = document.getElementById('user_table');
	print_data(tbody, users);
}

//Query data based on different fields
async function query_data(){
	//geocode('3848 Bloomington Crescent');

	var type = document.getElementById('Search').value;
	var text = document.getElementById('text').value;


	var users;
	if(type == "name") users = await query_type(text,'Name');
	else if(type == "id") users = await query_type(text,'Id');
	else if(type == "address") users = await query_type(text,'Address');

	var tbody = document.getElementById('query_table');
	print_data(tbody, users);
}


//Search firebase for any potential matches
function query_type(key_word, type){
	var data = new Array();
	var end = key_word + "\uf8ff";
	return new Promise(function(resolve, reject) {
    //Query for Name
	database.ref().child('Users').orderByChild(type).startAt(key_word).endAt(end).on("value", function(snapshot) {
			snapshot.forEach(function(child) {
        		 data.push(child.val());
    		});
    		resolve(data);
	});
  });
  data.length = 0;

}


//Print any data in table format
function print_data(tbody, users){
	var button_array = new Array();
	    
	while(tbody.hasChildNodes()){
   		tbody.removeChild(tbody.firstChild);
	}

	var tr = "<tr>";
	tr += "<td> <b> Result # </b> <td> <b> Card Number </b> </td> <td>  <b> Name </b> </td> <td> <b> Address </b>  </td> <td> <b> Books Signed Out </b>  </td></tr>"
	tbody.innerHTML += tr;

	var count = 1;
	button_ids.length = 0;

	for(var i in users){
		tr = "<tr>";
		var obj = users[i];
		button_ids.push(obj.Id);
		tr += "<td>" + count + "</td>" + "<td>" + obj.Id + "</td>" + "<td>" + obj.Name + "</td>" + "<td>" + obj.Address + "</td>" + "<td>" + obj.Books + "</td></tr>";
		tbody.innerHTML += tr;
		count++;
	}
}

//Get an address of a customer based on a string
function get_address(){
	var num = document.getElementById("result").value;
	var table = document.getElementById("query_table");
	if(num < 1 || table.rows[num]== undefined) return;
	var address = table.rows[num].cells[3].innerHTML;
	console.log(address);
	geocode(address);
}

function user_exists(users,id) {
  for(var i in users){
  	var user = users[i];
  	if(user.Id == id) return true;
  }
  return false;
}

//Need to fix function
function update_user(id, book, name, address){
	var done_append = false;
	return new Promise(function(resolve, reject) {

		database.ref().child('Users').orderByChild('Id').equalTo(id).on("value", function(snapshot) {
			snapshot.forEach(function(child) {
        		child.ref.update({
        			Books: book,
        			Name: name,
        			Address: address
        		});  
    		});

		});
	    resolve(done_append);
  	});
}


//Retrive data from firebase
function get_data(){

	var childData = new Array();

	return new Promise(function(resolve, reject) {
    	var user_list = database.ref('Users');

		user_list.on('value', function(snapshot) {
    		snapshot.forEach(function(childSnapshot) {
       			childData.push(childSnapshot.val());
    		});
    	resolve(childData);
		});
  });
}

//Use google geocode api to find location (will implement a map to diplay results soon based on lat and long coords)
function geocode(loc){
    axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
      params:{
        address:loc,
        key:'AIzaSyDyjYOaLDSRULDGQXQu9oJIrCMMWc27i4Y'
      }
    })
    .then(function(response){
      //console.log(response);
      console.log(response.data.results[0].formatted_address);
      //return response.data.results[0].formatted_address;
    })
    .catch(function(error){
      console.log(error)
    });
  }