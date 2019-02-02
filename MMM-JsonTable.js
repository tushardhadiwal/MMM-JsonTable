'use strict';

Module.register("MMM-JsonTable", {

	jsonData: null,

	// Default module config.
	defaults: {
		url: "",
		arrayName: null,
		tryFormatDate: false,
		updateInterval: 15000
	},

	start: function () {
		this.cam=0
		this.getJson();
		this.scheduleUpdate();
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.getJson();
		}, this.config.updateInterval);
	},

	// Request node_helper to get json from url
	getJson: function () {
		this.sendSocketNotification("MMM-JsonTable_GET_JSON", this.config.url);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "MMM-JsonTable_JSON_RESULT") {
			// Only continue if the notification came from the request we made
			// This way we can load the module more than once
			if (payload.url === this.config.url)
			{
				this.jsonData = payload.data;
				this.updateDom(500);
			}
		}
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "xsmall";

		if (!this.jsonData) {
			wrapper.innerHTML = "Awaiting json data...";
			return wrapper;
		}
		
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");
		
		var items = [];
		if (this.config.arrayName) {
			items = this.jsonData[this.config.arrayName];
		}
		else {
			items = this.jsonData;
		}

		// Check if items is of type array
		if (!(items instanceof Array)) {
			wrapper.innerHTML = "Json data is not of type array! " +
				"Maybe the config arrayName is not used and should be, or is configured wrong";
			return wrapper;
		}


		function pick(o, ...fields) {
			return fields.reduce((a, x) => {
				if(o.hasOwnProperty(x)) a[x] = o[x];
				return a;
			}, {});
		}


		var i,j;
		var pitems=[];
		var qitems=[];
      for (i = 0,j=0; i < items.length; i++) { 

		 if(items[i].deviceTelemetry !== null)
		 {
			pitems[j]=pick(items[i].deviceTelemetry.event,'device_id','image','crowd');
			qitems[j]=pick(items[i].deviceTelemetry.event,'device_id','crowd');
			j++;
		 }

	   }

	//    var res = Math.max.apply(Math,items.map(function(o){return o.crowd;}));
	//    var obj = items.find(function(o){ return o.crowd == res; })

	//    items= sortBy(items, 'crowd');

	// items= items.filter(x => x !== undefined);
	// items= items.filter(function(e){return e}); 
	   
	function compareIndexFound(a, b) {
		if (a.crowd > b.crowd) { return -1; }
		if (a.crowd < b.crowd) { return 1; }
		return 0;
	  }
	  pitems= pitems.sort(compareIndexFound);
	  qitems= qitems.sort(compareIndexFound);

	//   var pindex = pitems.findIndex(x => x.device_id==this.cam);
	  
	  this.cam= this.cam % pitems.length;
	  this.sendNotification('SHOW_NEWIMAGE', {pay: pitems[this.cam].image});
		

		qitems.forEach(element => {
			var row = this.getTableRow(element);
			tbody.appendChild(row);
		});

		table.appendChild(tbody);
		wrapper.appendChild(table);
		return wrapper;
	},

	getTableRow: function (jsonObject) {
		var row = document.createElement("tr");
		for (var key in jsonObject) {
			var cell = document.createElement("td");
			
			var valueToDisplay = "";
			if (this.config.tryFormatDate) {
				valueToDisplay = this.getFormattedValue(jsonObject[key]);
			}
			else {
				valueToDisplay = jsonObject[key];
			}

			var cellText = document.createTextNode(valueToDisplay);
			cell.appendChild(cellText);
			row.appendChild(cell);
		}
		return row;
	},

	// Format a date string or return the input
	getFormattedValue: function (input) {
		var m = moment(input);
		if (typeof input === "string" && m.isValid()) {
			// Show a formatted time if it occures today
			if (m.isSame(new Date(), "day") && m.hours() !== 0 && m.minutes() !== 0 && m.seconds() !== 0) {
				return m.format("HH:mm:ss");
			}
			else {
				return m.format("YYYY-MM-DD");
			}
		}
		else {
			return input;
		}
	},


	notificationReceived: function(notification, payload, sender) {

        if (notification === 'SHOW_NEXT')
        {
			
			Log.log('Notification Received from ' + sender.name + ' containing payload : ' );
			this.cam=this.cam+1;
			this.updateDom();
		}
		if (notification === 'SHOW_CAM')
        {
			var Small = {
				'zero': 0,
				'one': 1,
				'two': 2,
				'three': 3,
				'four': 4,
				'five': 5,
				'six': 6,
				'seven': 7,
				'eight': 8,
				'nine': 9,
				'ten': 10,
				'eleven': 11,
				'twelve': 12,
				'thirteen': 13,
				'fourteen': 14,
				'fifteen': 15,
				'sixteen': 16,
				'seventeen': 17,
				'eighteen': 18,
				'nineteen': 19,
				'twenty': 20,
				'thirty': 30,
				'forty': 40,
				'fifty': 50,
				'sixty': 60,
				'seventy': 70,
				'eighty': 80,
				'ninety': 90
			};
			
			var Magnitude = {
				'thousand':     1000,
				'million':      1000000,
				'billion':      1000000000,
				'trillion':     1000000000000,
				'quadrillion':  1000000000000000,
				'quintillion':  1000000000000000000,
				'sextillion':   1000000000000000000000,
				'septillion':   1000000000000000000000000,
				'octillion':    1000000000000000000000000000,
				'nonillion':    1000000000000000000000000000000,
				'decillion':    1000000000000000000000000000000000,
			};
			
			var a, n, g;
			function text2num(s) {
				a = s.toString().split(/[\s-]+/);
				n = 0;
				g = 0;
				a.forEach(feach);
				return n + g;
			}
			
			function feach(w) {
				var x = Small[w];
				if (x != null) {
					g = g + x;
				}
				else if (w == "hundred") {
					g = g * 100;
				}
				else {
					x = Magnitude[w];
					if (x != null) {
						n = n + g * x
						g = 0;
					}
					else { 
						// alert("Unknown number: "+w); 
						Log.log("Unknown number: "+w)
					}
				}
			}

			function isNumber(n) {
				return !isNaN(parseFloat(n)) && isFinite(n);
			  }

			Log.log('Notification Received from ' + sender.name + ' containing payload : ' );
			if (isNumber(payload.pay))
			{
				this.cam=payload.pay;
			}
			else
			{
				this.cam=text2num(payload.pay);
			}

			
			this.updateDom();
		}
		

		if (notification === 'SHOW_SECTION')
        {
			Log.log('Notification Received from ' + sender.name + ' containing payload : ' + payload.pay);
			//ToDo: Update the parsing logic according the new API and update the following URL.
			// this.config.url="https://thd-prod-backend.westus2.cloudapp.azure.com/api/sections/"+payload.pay+"/stats";
			this.config.url="https://thd-prod-backend.westus2.cloudapp.azure.com/api/Devices/";
			// this.config.url="https://thd-dev-andrey-backend.westus2.cloudapp.azure.com/api/v1/cameras?floor=F3"
			this.getJson();
			this.updateDom();
			this.sendNotification('HIDE_HEATMAP');
			this.sendNotification('SHOW_CROWD_COUNT');
			this.show(100);

		}

		if (notification === 'HIDE_CROWD_COUNT') {
			this.hide();
		}  else if (notification === 'SHOW_CROWD_COUNT') {
			this.show(100);
		}
		if ( notification === 'DOM_OBJECTS_CREATED') {
			//now the Dom is ready; you can call hide() or show().
			//  this.hide(0);
		} 
		

        
    }

});