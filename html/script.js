
window.onload = function() {
    var fileInput = document.getElementById('fileInput');
    var fileStatus = document.getElementById('fileStatus');
    var form = document.getElementById('form');
    var output = document.getElementById('output');
    var xsdWarn = document.getElementById('xsd-warn');

	var xmlData = 0, schemaData = xsd, xmlFileName;

	function toggleDiv(id) {
    	var div = document.getElementById(id);
    	div.style.display = div.style.display == "none" ? "block" : "none";
	}

    fileInput.addEventListener('change', function(e) {
    	var f = fileInput.files[0];

		var filereader = new FileReader();

			filestring = "<strong>" + escape(f.name) + 
							"</strong> (" + (f.type || "n/a") + "): " + f.size + " bytes - " + 
							"<strong>last modified:</strong> " + (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : "n/a");
			
			filereader.readAsText(f);
			filereader.onload = (function(theFile) {
				return function(e) {
					xmlData = e.target.result;
					xmlFileName = f.name;
				};
			})(f);

			fileStatus.innerHTML = filestring;
			toggleDiv('fileStatus');
    });

	// load schema or fallback to use lcoal schema
    try {
    	fetch('https://admarkt.marktplaats.nl/api/sellside/feed/xsd', {
    		 mode: 'no-cors'
    	})
		.then(function(data) {
			console.log("loaded XML schema from admarkt") ;
			if (data !== null && data.body !== null) {
				schemaData = data;
			} else {
				//xsdWarn.innerHTML = "<aside class='warning'>failed to load recent XSD from server, using default</aside>";
			}
		})
		.catch(function(err) { 
			//xsdWarn.innerHTML = "<aside class='warning'>failed to load recent XSD from server, using default</aside>";
		})
	} catch(err) {
		console.log(err);
	}

	var process = function() {
		var Module = {
			xml: xmlData,
			schema: schemaData,
		};
		var result = xmllint.validateXML(Module).errors;

		var output = '';
		// replace output file name
		for (var i in result) {
		    output += result[i].replace(/^file_0\.xml/, xmlFileName) + "\n";
        }
        return output;
	}

	form.onsubmit = function (e) {
		output.innerHTML = "<aside class='normal'>Processing.. Depending on xml size, it might take a while. Page will not be responsive during the process</aside>";

		setTimeout(function() {
			var result = process();
			output.innerHTML = "<pre>" + result + "</pre>";
		}, 100);
		
		e.preventDefault();
		
	}
}